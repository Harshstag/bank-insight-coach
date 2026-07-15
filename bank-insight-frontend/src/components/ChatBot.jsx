import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage, clearChatHistory } from "../api/chatApi";

const QUESTIONS = [
  "Can I afford an AC this month?",
  "What's my biggest expense?",
  "How much should I save?",
  "Am I on track financially?",
  "Can I afford an EMI of ₹5,000?",
  "Where am I overspending?",
];

const BotIcon = ({ size = 20, color = "#7C3AED" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="12" rx="3" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    <circle cx="9" cy="14" r="1" fill={color} /><circle cx="15" cy="14" r="1" fill={color} />
    <path d="M12 17v1" />
  </svg>
);
const SendIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

function Dots() {
  return (
    <div className="fp-row">
      <div className="fp-ai-av"><BotIcon size={16} /></div>
      <div className="fp-typing">
        {[0,180,360].map(d=><span key={d} className="fp-dot" style={{animationDelay:`${d}ms`}}/>)}
      </div>
    </div>
  );
}

function Bubble({ msg }) {
  const u = msg.role === "user";
  return (
    <div className={u ? "fp-row fp-row-user" : "fp-row"}>
      <div className={u ? "fp-user-av" : "fp-ai-av"}>
        {u ? <span style={{fontSize:13}}>👤</span> : <BotIcon size={16}/>}
      </div>
      <div className={u ? "fp-bubble fp-bubble-user" : "fp-bubble fp-bubble-ai"}>
        {msg.content}
      </div>
    </div>
  );
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const [msgs, setMsgs] = useState([{
    role:"assistant",
    content:"Hi! I'm Twin AI by Harshstag — your personal financial coach ✨\n\nUpload your bank statement and ask me anything: affordability checks, savings goals, EMI planning, and more!",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(()=>{
    const esc = e => { if(e.key==="Escape") setOpen(false); };
    window.addEventListener("keydown", esc);
    return ()=> window.removeEventListener("keydown", esc);
  },[]);

  useEffect(()=>{
    document.body.style.overflow = open ? "hidden" : "";
    if(open){ setHasNew(false); setTimeout(()=>inputRef.current?.focus(),250); }
    return ()=>{ document.body.style.overflow=""; };
  },[open]);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,loading]);

  const send = async text => {
    const msg = (text??input).trim();
    if(!msg||loading) return;
    setInput("");
    setMsgs(p=>[...p,{role:"user",content:msg}]);
    setLoading(true);
    try {
      const {reply} = await sendChatMessage(msg);
      setMsgs(p=>[...p,{role:"assistant",content:reply}]);
      if(!open) setHasNew(true);
    } catch {
      setMsgs(p=>[...p,{role:"assistant",content:"⚠️ Couldn't reach the server. Make sure all services are running."}]);
    } finally { setLoading(false); }
  };

  const clear = async () => {
    try{ await clearChatHistory(); }catch(_){}
    setMsgs([{role:"assistant",content:"Chat cleared! How can I help with your finances today? ✨"}]);
  };

  const onKey = e => { if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); send(); } };
  const isWelcome = msgs.length===1&&!loading;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .fp-root,.fp-root * { font-family:'Inter',system-ui,sans-serif; box-sizing:border-box; }

        /* ── Animations ── */
        @keyframes fpDot    { 0%,60%,100%{transform:translateY(0);opacity:.35} 30%{transform:translateY(-6px);opacity:1} }
        @keyframes fpFade   { from{opacity:0} to{opacity:1} }
        @keyframes fpSlide  { from{opacity:0;transform:translate(-50%,-48%) scale(.97)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        @keyframes fpSlideM { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fpMsg    { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fpPulse  { 0%,100%{box-shadow:0 6px 20px rgba(124,58,237,.45)} 50%{box-shadow:0 6px 32px rgba(124,58,237,.7)} }

        /* ── FAB ── */
        #fp-fab { animation:fpPulse 2.6s ease-in-out infinite; transition:transform .18s; }
        #fp-fab:hover  { transform:scale(1.1)!important; }
        #fp-fab:active { transform:scale(.94)!important; }

        /* ── Scrollbars ── */
        #fp-msgs::-webkit-scrollbar       { width:4px; }
        #fp-msgs::-webkit-scrollbar-track { background:transparent; }
        #fp-msgs::-webkit-scrollbar-thumb { background:#DDD6FE; border-radius:10px; }
        #fp-mchips::-webkit-scrollbar { display:none; }

        /* ── Interactive ── */
        #fp-wrap:focus-within { border-color:#7C3AED!important; box-shadow:0 0 0 3px rgba(124,58,237,.14)!important; }
        #fp-input             { outline:none; }
        .fp-chip:hover        { background:#DDD6FE!important; border-color:#7C3AED!important; }
        .fp-clear:hover       { background:#F5F3FF!important; color:#7C3AED!important; }
        .fp-close:hover       { background:#F3F4F6!important; }
        .fp-send:hover:not(:disabled) { transform:scale(1.07); }
        .fp-msg               { animation:fpMsg .22s ease; }

        /* ── Bubbles ── */
        .fp-row       { display:flex; align-items:flex-end; gap:10px; }
        .fp-row-user  { flex-direction:row-reverse; justify-content:flex-start; }

        .fp-ai-av  { width:32px;height:32px;border-radius:50%;background:#EDE9FE;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px rgba(124,58,237,.15); }
        .fp-user-av{ width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#9F67FA);display:flex;align-items:center;justify-content:center;flex-shrink:0; }

        .fp-bubble      { max-width:72%;padding:11px 16px;border-radius:18px;font-size:14px;line-height:1.65;white-space:pre-wrap;word-break:break-word;font-weight:440; }
        .fp-bubble-ai   { background:#fff;color:#1A1A2E;border-bottom-left-radius:4px;box-shadow:0 2px 10px rgba(0,0,0,.07); }
        .fp-bubble-user { background:linear-gradient(135deg,#7C3AED,#9F67FA);color:#fff;border-bottom-right-radius:4px;box-shadow:0 4px 14px rgba(124,58,237,.3); }

        .fp-typing { background:#fff;border-radius:18px;border-bottom-left-radius:4px;padding:13px 18px;display:flex;gap:5px;align-items:center;box-shadow:0 2px 10px rgba(0,0,0,.07); }
        .fp-dot    { display:inline-block;width:8px;height:8px;border-radius:50%;background:#7C3AED;animation:fpDot 1.3s ease-in-out infinite; }

        /* ═══════════════════════════════════════════
           DESKTOP MODAL  (>= 640px)
        ═══════════════════════════════════════════ */
        #fp-modal {
          position:fixed; top:50%; left:50%;
          transform:translate(-50%,-50%);
          z-index:9001;
          width:calc(100vw - 48px); height:calc(100vh - 64px);
          max-width:1200px; max-height:800px; min-height:520px;
          border-radius:24px; overflow:hidden;
          display:flex; background:#fff;
          box-shadow:0 40px 100px rgba(124,58,237,.22),0 8px 32px rgba(0,0,0,.15);
          border:1px solid #EDE9FE;
          animation:fpSlide .28s cubic-bezier(.34,1.4,.64,1);
        }

        #fp-sidebar {
          width:28%; min-width:210px; max-width:290px; flex-shrink:0;
          background:linear-gradient(170deg,#F5F3FF 0%,#EDE9FE 100%);
          border-right:1px solid #DDD6FE;
          display:flex; flex-direction:column;
          padding:24px 16px 18px; overflow-y:auto;
        }

        #fp-mobile-chips { display:none; }

        /* ═══════════════════════════════════════════
           MOBILE MODAL  (< 640px)
        ═══════════════════════════════════════════ */
        @media (max-width:639px) {
          #fp-modal {
            top:0; left:0; right:0; bottom:0;
            transform:none;
            width:100%; height:100%;
            max-width:100%; max-height:100%;
            min-height:100%;
            border-radius:0;
            flex-direction:column;
            animation:fpSlideM .28s ease;
          }

          /* Hide desktop sidebar on mobile */
          #fp-sidebar { display:none !important; }

          /* Show mobile chip strip */
          #fp-mobile-chips {
            display:flex;
            gap:8px;
            overflow-x:auto;
            padding:10px 16px;
            background:#F5F3FF;
            border-bottom:1px solid #DDD6FE;
            flex-shrink:0;
            -webkit-overflow-scrolling:touch;
            scrollbar-width:none;
          }
          .fp-mchip {
            flex-shrink:0;
            background:white; border:1.5px solid #DDD6FE;
            color:#4C1D95; border-radius:20px;
            padding:6px 13px; font-size:12.5px; font-weight:500;
            cursor:pointer; white-space:nowrap;
            transition:background .15s,border-color .15s;
            font-family:inherit;
          }
          .fp-mchip:hover { background:#DDD6FE!important; border-color:#7C3AED!important; }

          /* Adjust header for mobile */
          #fp-chat-header { padding:12px 14px !important; }
          #fp-header-title { font-size:14px !important; }
          #fp-header-meta  { font-size:10.5px !important; }

          /* Messages area fills remaining space */
          #fp-msgs { padding:14px 14px !important; }

          /* Bubbles narrower on small screen */
          .fp-bubble { max-width:85% !important; font-size:13.5px !important; }

          /* Input area */
          #fp-input-section { padding:10px 12px 14px !important; }
          #fp-wrap          { padding:8px 8px 8px 14px !important; }
          #fp-input         { font-size:13.5px !important; }

          /* Hint banner */
          #fp-hint { margin:0 14px 10px !important; }

          /* FAB smaller on mobile */
          #fp-fab { width:52px!important; height:52px!important; bottom:20px!important; left:20px!important; }
        }
      `}</style>

      {/* ── FAB ───────────────────────────────────────────────────────────── */}
      {!open && (
        <button
          id="fp-fab"
          className="fp-root"
          onClick={()=>setOpen(true)}
          aria-label="Open Twin AI"
          title="Twin AI Coach"
          style={{
            position:"fixed", bottom:32, left:32, zIndex:9999,
            width:58, height:58, borderRadius:"50%", border:"none", cursor:"pointer",
            background:"linear-gradient(135deg,#7C3AED 0%,#9F67FA 100%)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 6px 20px rgba(124,58,237,.45)",
          }}
        >
          <BotIcon size={26} color="white"/>
          {hasNew && <span style={{position:"absolute",top:7,right:7,width:11,height:11,borderRadius:"50%",background:"#EF4444",border:"2.5px solid white"}}/>}
        </button>
      )}

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {open && (
        <div className="fp-root">
          {/* Backdrop */}
          <div
            onClick={()=>setOpen(false)}
            style={{
              position:"fixed", inset:0, zIndex:9000,
              background:"rgba(10,5,30,.6)", backdropFilter:"blur(5px)",
              animation:"fpFade .2s ease",
            }}
          />

          <div id="fp-modal" role="dialog" aria-modal="true" aria-label="Twin AI Chat">

            {/* ── Desktop sidebar ──────────────────────────────────────── */}
            <div id="fp-sidebar">
              {/* Brand */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",gap:6,flexShrink:0}}>
                <div style={{width:52,height:52,borderRadius:"50%",background:"white",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(124,58,237,.22)",marginBottom:4}}>
                  <BotIcon size={26}/>
                </div>
                <p style={{margin:0,fontSize:17,fontWeight:700,color:"#1A1A2E",letterSpacing:"-0.3px"}}>Twin AI</p>
                <p style={{margin:0,fontSize:12,color:"#6B7280",fontWeight:500}}>By Harshstag</p>
                <div style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:4,background:"#DCFCE7",border:"1.5px solid #BBF7D0",borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700,color:"#166534"}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:"#22C55E",display:"inline-block",flexShrink:0}}/>
                  Online & Ready
                </div>
              </div>
              <div style={{height:1,background:"#DDD6FE",margin:"16px 0 12px",flexShrink:0}}/>
              <p style={{margin:"0 0 10px",fontSize:10,fontWeight:700,color:"#7C3AED",textTransform:"uppercase",letterSpacing:"0.9px",flexShrink:0}}>✨ Try asking</p>
              <div style={{display:"flex",flexDirection:"column",gap:7,flex:1,overflowY:"auto"}}>
                {QUESTIONS.map(q=>(
                  <button key={q} className="fp-chip" onClick={()=>send(q)}
                    style={{background:"white",border:"1.5px solid #DDD6FE",color:"#4C1D95",borderRadius:10,padding:"8px 12px",fontSize:12.5,fontWeight:500,textAlign:"left",width:"100%",lineHeight:1.4,cursor:"pointer",fontFamily:"inherit",transition:"background .15s"}}>
                    {q}
                  </button>
                ))}
              </div>
              <button className="fp-clear" onClick={clear}
                style={{marginTop:14,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"transparent",border:"1.5px solid #DDD6FE",borderRadius:10,padding:"8px 12px",fontSize:12,fontWeight:500,color:"#9CA3AF",width:"100%",cursor:"pointer",fontFamily:"inherit",transition:"background .15s,color .15s"}}>
                <TrashIcon/> Clear conversation
              </button>
            </div>

            {/* ── Chat panel ───────────────────────────────────────────── */}
            <div style={{flex:1,display:"flex",flexDirection:"column",background:"#FAFAF9",minWidth:0}}>

              {/* Header */}
              <div id="fp-chat-header" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",background:"#fff",borderBottom:"1px solid #F3F0FF",flexShrink:0}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:"#EDE9FE",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 2px 10px rgba(124,58,237,.18)"}}>
                    <BotIcon size={19}/>
                  </div>
                  <div>
                    <p id="fp-header-title" style={{margin:0,fontSize:15,fontWeight:700,color:"#1A1A2E",letterSpacing:"-0.2px"}}>Twin AI</p>
                    <div id="fp-header-meta" style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
                      <span style={{width:6,height:6,borderRadius:"50%",background:"#22C55E",display:"inline-block"}}/>
                      <span style={{fontSize:11.5,color:"#6B7280",fontWeight:500}}>Powered by Gemini · RAG-grounded</span>
                    </div>
                  </div>
                </div>
                <button className="fp-close" onClick={()=>setOpen(false)} aria-label="Close chat"
                  style={{width:36,height:36,borderRadius:10,border:"none",background:"#F9F8FF",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",transition:"background .15s"}}>
                  <CloseIcon/>
                </button>
              </div>

              {/* Mobile chip strip — hidden on desktop via CSS */}
              <div id="fp-mobile-chips">
                {QUESTIONS.map(q=>(
                  <button key={q} className="fp-mchip" onClick={()=>send(q)}>{q}</button>
                ))}
              </div>

              {/* Messages */}
              <div id="fp-msgs" style={{flex:1,overflowY:"auto",padding:"20px 24px",display:"flex",flexDirection:"column",gap:14}}>
                {msgs.map((msg,i)=>(
                  <div key={i} className="fp-msg"><Bubble msg={msg}/></div>
                ))}
                {loading && <Dots/>}
                <div ref={bottomRef}/>
              </div>

              {/* Welcome hint */}
              {isWelcome && (
                <div id="fp-hint" style={{margin:"0 24px 14px",background:"#F5F3FF",border:"1.5px dashed #C4B5FD",borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                  <span style={{fontSize:16,flexShrink:0}}>💡</span>
                  <span style={{fontSize:13,color:"#6B7280",fontWeight:500,lineHeight:1.4}}>
                    Pick a question from the left panel, or type your own below.
                  </span>
                </div>
              )}

              {/* Input */}
              <div id="fp-input-section" style={{padding:"12px 20px 16px",background:"#fff",borderTop:"1px solid #F3F0FF",flexShrink:0}}>
                <div id="fp-wrap" style={{display:"flex",alignItems:"center",gap:10,background:"#F5F3FF",borderRadius:14,border:"1.5px solid #DDD6FE",padding:"9px 9px 9px 16px",transition:"border-color .2s,box-shadow .2s"}}>
                  <textarea
                    id="fp-input" ref={inputRef}
                    rows={1} value={input}
                    onChange={e=>setInput(e.target.value)}
                    onKeyDown={onKey}
                    placeholder="Ask about your finances…"
                    disabled={loading}
                    style={{flex:1,resize:"none",background:"transparent",border:"none",color:"#1A1A2E",fontSize:14,lineHeight:1.5,fontFamily:"inherit",fontWeight:450,padding:0,maxHeight:80,overflowY:"auto"}}
                  />
                  <button className="fp-send" onClick={()=>send()} disabled={!input.trim()||loading} aria-label="Send"
                    style={{width:40,height:40,borderRadius:12,border:"none",background:"linear-gradient(135deg,#7C3AED,#9F67FA)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 4px 12px rgba(124,58,237,.35)",opacity:!input.trim()||loading?0.4:1,cursor:!input.trim()||loading?"not-allowed":"pointer",transition:"opacity .18s,transform .15s"}}>
                    <SendIcon/>
                  </button>
                </div>
                <p style={{margin:"6px 0 0",textAlign:"center",fontSize:11,color:"#9CA3AF",fontWeight:500}}>
                  Shift+Enter for new line
                </p>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
