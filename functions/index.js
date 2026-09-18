import { onRequest } from "firebase-functions/v2/https";
import { defineSecret, defineString } from "firebase-functions/params";
import OpenAI from "openai";

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const VECTOR_STORE_ID = defineString("TBRN_VECTOR_STORE_ID", { default: "" });

const SYSTEM = `You are Nova, TBRN's internal AI assistant for insurance surveying and claims support.
Use supplied TBRN knowledge as the source of truth for TBRN procedures, templates, contractor coverage and internal rules.
Never invent a TBRN procedure, contractor allocation, claim fact, document or cost.
Clearly separate: (1) facts evidenced by supplied material, (2) professional assessment/inference, and (3) missing evidence.
For claim reviews, consider causation, scope, necessity, betterment, reasonableness of labour/material costs, duplication, VAT, supporting evidence and proportionate next steps.
Write in concise professional UK insurance language.
Do not make final liability, coverage, fraud or settlement decisions on behalf of a human handler.
If the knowledge base does not support a TBRN-specific answer, say that explicitly.`;

function cors(res){
  res.set("Access-Control-Allow-Origin","*");
  res.set("Access-Control-Allow-Headers","Content-Type, Authorization");
  res.set("Access-Control-Allow-Methods","POST, GET, OPTIONS");
}
function extractCitations(response){
  const found=[];
  for(const item of response.output||[]){
    for(const c of item.content||[]){
      for(const a of c.annotations||[]){
        const name=a.filename||a.file_citation?.filename;
        if(name&&!found.includes(name)) found.push(name);
      }
    }
  }
  return found;
}

export const api = onRequest({region:"europe-west2",secrets:[OPENAI_API_KEY],timeoutSeconds:120,memory:"512MiB"}, async(req,res)=>{
  cors(res);
  if(req.method==="OPTIONS") return res.status(204).send("");
  const path=req.path.replace(/\/$/,"");
  if(req.method==="GET" && path==="/health") return res.json({ok:true,service:"tbrn-ai",knowledge:Boolean(VECTOR_STORE_ID.value())});
  if(req.method!=="POST" || path!=="/tbrn-ai") return res.status(404).json({error:"Not found"});

  const message=String(req.body?.message||"").trim();
  if(!message) return res.status(400).json({error:"Message required"});
  if(message.length>12000) return res.status(413).json({error:"Message too long"});

  try{
    const openai=new OpenAI({apiKey:OPENAI_API_KEY.value()});
    const tools=[];
    if(VECTOR_STORE_ID.value()) tools.push({type:"file_search",vector_store_ids:[VECTOR_STORE_ID.value()],max_num_results:8});

    const response=await openai.responses.create({
      model:"gpt-5.6-terra",
      instructions:SYSTEM,
      input:message,
      tools,
      reasoning:{effort:"medium"},
      max_output_tokens:2500
    });

    return res.json({answer:response.output_text||"No answer returned.",sources:extractCitations(response),grounded:Boolean(VECTOR_STORE_ID.value())});
  }catch(error){
    console.error("TBRN AI error",error);
    return res.status(500).json({error:"Nova could not complete this request."});
  }
});
