/**
 * PAWMOIRE customization intake + proof approval API (Cloudflare Worker).
 * Test Worker using KV namespace ORDERS for metadata and images.
 * Configure ADMIN_TOKEN and ALLOWED_ORIGIN in the Worker environment.
 * Never expose storage keys or the admin token to browsers.
 * KV is eventually consistent: do not use it as a payment or production ledger.
 */
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...headers}});
const error=(message,status=400)=>json({error:message},status);
const validEmail=s=>typeof s==="string"&&s.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const allowedTypes=new Map([["image/jpeg","jpg"],["image/png","png"],["image/webp","webp"]]);
const maxBytes=8*1024*1024;
const encode=async value=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,"0")).join("");
function isImage(bytes,type){return type==="image/jpeg"&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255||type==="image/png"&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v)||type==="image/webp"&&String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP";}
function cors(request,env){const origin=request.headers.get("Origin");return origin&&origin===env.ALLOWED_ORIGIN?{"access-control-allow-origin":origin,"vary":"Origin","access-control-allow-methods":"POST, GET, OPTIONS","access-control-allow-headers":"Content-Type, Authorization"}:{};}
function admin(request,env){const expected=env.ADMIN_TOKEN;const received=request.headers.get("Authorization")||"";return typeof expected==="string"&&expected.length>=32&&received===`Bearer ${expected}`;}
async function load(env,id){const item=await env.ORDERS.get("order:"+id,"json");return item||null;}
export default {async fetch(request,env){
 const headers=cors(request,env),origin=request.headers.get("Origin"),url=new URL(request.url),path=url.pathname;
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers});
 // Browser write operations must originate from the configured storefront.
 if(request.method==="POST"&&origin!==env.ALLOWED_ORIGIN)return json({error:"Origin not allowed"},403,headers);
 try{
 if(path==="/api/customizations"&&request.method==="POST"){
  const length=Number(request.headers.get("content-length")||0);
  if(length>maxBytes+16384)return json({error:"Upload too large (8 MB maximum)"},413,headers);
  const form=await request.formData(),photo=form.get("photo");
  if(!(photo instanceof File)||!allowedTypes.has(photo.type)||photo.size<1||photo.size>maxBytes)return json({error:"Upload a JPEG, PNG or WebP photo up to 8 MB"},400,headers);
  const bytes=new Uint8Array(await photo.arrayBuffer());
  if(!isImage(bytes,photo.type))return json({error:"Image content does not match its file type"},400,headers);
  const email=String(form.get("customerEmail")||"").trim(),productId=String(form.get("productId")||"").trim(),quantity=Number(form.get("quantity")||1);
  if(!validEmail(email)||!/^p[1-8]$/.test(productId)||!Number.isInteger(quantity)||quantity<1||quantity>20)return json({error:"Invalid email, product or quantity"},400,headers);
  const petName=String(form.get("petName")||"").trim(),notes=String(form.get("notes")||"").trim(),photoPreference=String(form.get("photoPreference")||"").trim();
  if(petName.length>120||notes.length>2000||photoPreference.length>300)return json({error:"One or more text fields are too long"},400,headers);
  let selectedOptions={};try{selectedOptions=JSON.parse(String(form.get("selectedOptions")||"{}"));}catch{return json({error:"Invalid options"},400,headers);}
  if(!selectedOptions||Array.isArray(selectedOptions)||typeof selectedOptions!=="object"||Object.keys(selectedOptions).length>20||Object.entries(selectedOptions).some(([k,v])=>k.length>100||typeof v!=="string"||v.length>300))return json({error:"Invalid options"},400,headers);
  if(form.get("photoConsent")!=="true")return json({error:"Photo permission is required"},400,headers);
  const id=crypto.randomUUID(),key="private/"+id+"."+allowedTypes.get(photo.type);
  await env.ORDERS.put(key,bytes.buffer,{metadata:{contentType:photo.type}});
  const record={customizationId:id,productId,quantity,customerEmail:email,petName,notes,photoPreference,selectedOptions,photoObjectKey:key,shopifyOrderId:null,proofStatus:"draft",createdAt:new Date().toISOString(),approvedAt:null};
  try{await env.ORDERS.put("order:"+id,JSON.stringify(record));}catch(e){await env.ORDERS.delete(key);throw e;}
  return json({customizationId:id,status:"draft",message:"Customization request received; payment has NOT been taken."},201,headers);
 }
 const matchAdmin=path.match(/^\/api\/admin\/customizations\/([a-f0-9-]{36})(?:\/(photo|proof))?$/);
 if(matchAdmin){
  if(!admin(request,env))return json({error:"Unauthorized"},401,headers);
  const record=await load(env,matchAdmin[1]);if(!record)return json({error:"Not found"},404,headers);
  if(request.method==="GET"&&matchAdmin[2]==="photo"){
   const object=await env.ORDERS.getWithMetadata(record.photoObjectKey,'arrayBuffer');
   if(!object.value)return json({error:"Original photo not found"},404,headers);
   return new Response(object.value,{status:200,headers:{"content-type":object.metadata?.contentType||"application/octet-stream","cache-control":"no-store",...headers}});
  }
  if(request.method==="GET"&&!matchAdmin[2])return json(record,200,headers);
  if(request.method==="POST"&&matchAdmin[2]==="proof"){
   if(!["draft","revision_requested"].includes(record.proofStatus))return json({error:"Proof already pending or approved"},409,headers);
   const form=await request.formData(),proof=form.get("proof");
   if(!(proof instanceof File)||!allowedTypes.has(proof.type)||proof.size<1||proof.size>maxBytes)return json({error:"Upload a JPEG, PNG or WebP proof up to 8 MB"},400,headers);
   const bytes=new Uint8Array(await proof.arrayBuffer());
   if(!isImage(bytes,proof.type))return json({error:"Proof image content does not match its file type"},400,headers);
   const proofKey="private/proofs/"+record.customizationId+"."+allowedTypes.get(proof.type);
   await env.ORDERS.put(proofKey,bytes.buffer,{metadata:{contentType:proof.type}});
   const token=crypto.randomUUID()+"-"+crypto.randomUUID(),hash=await encode(token);
   record.proofObjectKey=proofKey;record.proofStatus="proof_sent";record.proofSentAt=new Date().toISOString();
   await env.ORDERS.put("order:"+record.customizationId,JSON.stringify(record));
   await env.ORDERS.put("proof:"+hash,record.customizationId,{expirationTtl:60*60*24*14});
   const proofUrl=new URL("/proof-review.html",env.ALLOWED_ORIGIN);
   proofUrl.searchParams.set("token",token);proofUrl.searchParams.set("api",new URL(request.url).origin);
   return json({proofUrl:proofUrl.toString(),expiresInDays:14,status:"proof_sent"},200,headers);
  }
 }
 const matchProof=path.match(/^\/api\/proof\/([a-f0-9-]{73})(?:\/(image|respond))?$/);
 if(matchProof){
  const id=await env.ORDERS.get("proof:"+await encode(matchProof[1]));
  if(!id)return json({error:"Invalid or expired proof link"},404,headers);
  const record=await load(env,id);
  if(!record||record.proofStatus!=="proof_sent")return json({error:"Proof is no longer awaiting review"},409,headers);
  if(request.method==="GET"&&matchProof[2]==="image"){
   if(!record.proofObjectKey)return json({error:"Design proof is not available"},404,headers);
   const object=await env.ORDERS.getWithMetadata(record.proofObjectKey,'arrayBuffer');
   if(!object.value)return json({error:"Design proof is not available"},404,headers);
   return new Response(object.value,{status:200,headers:{"content-type":object.metadata?.contentType||"application/octet-stream","cache-control":"no-store",...headers}});
  }
  if(request.method==="GET"&&!matchProof[2])return json({petName:record.petName,productId:record.productId,proofStatus:record.proofStatus,proofImageUrl:"/api/proof/"+encodeURIComponent(matchProof[1])+"/image"},200,headers);
  if(request.method==="POST"&&matchProof[2]==="respond"){
   const body=await request.json(),decision=body?.decision;
   if(!["approved","revision_requested"].includes(decision))return json({error:"Invalid decision"},400,headers);
   if(decision==="revision_requested"&&(!body.notes||String(body.notes).length>2000))return json({error:"Provide revision notes (up to 2000 characters)"},400,headers);
   record.proofStatus=decision;record.approvedAt=decision==="approved"?new Date().toISOString():null;
   if(decision==="revision_requested")record.revisionNotes=String(body.notes);
   await env.ORDERS.put("order:"+id,JSON.stringify(record));
   await env.ORDERS.delete("proof:"+await encode(matchProof[1]));
   return json({customizationId:id,proofStatus:decision},200,headers);
  }
 }
 return json({error:"Not found"},404,headers);
 }catch(e){return json({error:"Request failed; please retry or contact support"},500,headers);}
}};
