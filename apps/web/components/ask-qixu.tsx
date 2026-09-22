"use client";
import { useState } from "react";
import { Send, Sparkles, X } from "lucide-react";
import { Button } from "./ui/button";
export function AskQixu() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  return <><button type="button" className="floating-ask" onClick={() => setOpen(true)}><Sparkles size={17}/>问问栖序</button>{open ? <div className="dialog-backdrop" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="ask-title" className="ask-dialog"><div className="flex items-center justify-between border-b border-[var(--border)] p-5"><div><h2 id="ask-title" className="font-display text-lg font-bold">问问栖序</h2><p className="mt-1 text-sm text-[var(--muted)]">仅使用已连接的内部数据回答。</p></div><button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="关闭问问栖序"><X size={18}/></button></div><div className="p-5"><div className="ask-empty"><Sparkles size={24}/><b>你想了解什么？</b><p>例如：“哪些商品流量高，但转化率偏低？”</p></div><form noValidate onSubmit={(event) => event.preventDefault()} className="ask-form"><label htmlFor="ask-input" className="sr-only">问题</label><textarea id="ask-input" className="resize-none" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="询问销售、商品、搜索或库存…"/><Button type="submit" disabled={!question.trim()}><Send data-icon="inline-end"/>发送</Button></form></div></section></div> : null}</>;
}
