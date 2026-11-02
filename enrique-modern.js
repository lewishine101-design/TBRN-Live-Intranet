(function () {
  'use strict';

  const frame = document.getElementById('enriqueAssistantFrame');
  if (!frame) return;

  const modernise = () => {
    const doc = frame.contentDocument;
    if (!doc || doc.getElementById('tbrn-enrique-modern')) return;

    const style = doc.createElement('style');
    style.id = 'tbrn-enrique-modern';
    style.textContent = `
      :root{
        --navy:#082f3d;
        --navy2:#0b5260;
        --cyan:#48b9b0;
        --ink:#15383d;
        --muted:#687d7d;
        --line:#d8e3df;
        --bg:#f4f7f4;
        --shadow:0 24px 70px rgba(2,27,35,.30),0 4px 18px rgba(2,27,35,.16)
      }
      .launcher{
        right:18px!important;bottom:14px!important;gap:9px!important;
        padding:7px 14px 7px 7px!important;
        border:1px solid rgba(255,255,255,.18)!important;
        background:linear-gradient(135deg,#073342,#0b5664)!important;
        box-shadow:0 12px 34px rgba(2,26,34,.34)!important;
        letter-spacing:.01em
      }
      .launcher-mark{width:43px!important;height:43px!important;background:linear-gradient(145deg,#f4fbf7,#bce1d5)!important;box-shadow:inset 0 0 0 1px #ffffffaa}
      .launcher:after{top:5px!important;left:39px!important;background:#45d38c!important}
      .assistant{
        right:18px!important;bottom:14px!important;
        width:min(360px,calc(100vw - 28px))!important;
        height:min(570px,calc(100vh - 28px))!important;
        border:1px solid rgba(161,188,182,.72)!important;
        border-radius:20px!important;
        box-shadow:var(--shadow)!important
      }
      .chat-head{
        position:relative;min-height:76px;padding:12px 13px!important;gap:11px!important;
        background:linear-gradient(125deg,#072f3c 0%,#0a4552 57%,#0d5d68 100%)!important;
        border-bottom:1px solid rgba(255,255,255,.12)
      }
      .chat-head:after{content:"TBRN ASSISTANT";position:absolute;right:14px;bottom:7px;color:rgba(213,239,232,.42);font-size:8px;font-weight:900;letter-spacing:.15em}
      .chat-head .avatar{width:52px!important;height:52px!important;flex-basis:52px!important;padding:2px!important;border-radius:16px!important;background:linear-gradient(145deg,#f8fcf8,#c7e3d9)!important;box-shadow:0 5px 16px rgba(0,0,0,.2),inset 0 0 0 1px #ffffffcc}
      .chat-heading strong{font-size:16px;letter-spacing:.01em}
      .chat-heading small{margin-top:3px!important;color:#cfe2dd!important;font-size:10px}
      .head-tools{align-self:flex-start}
      .head-btn{width:31px!important;height:31px!important;border-radius:9px!important;font-size:18px!important}
      .suggestions{padding:9px 10px!important;gap:6px!important;background:#eef4f1!important;border-color:#d9e5e0!important}
      .quick{padding:6px 9px!important;border-color:#c9dcd5!important;color:#315c5c!important;font-size:10px!important;font-weight:700;background:#fbfdfc!important}
      .quick:hover{background:#dff1eb!important;border-color:#77b7a9!important}
      .messages{padding:12px!important;background:linear-gradient(180deg,#f3f7f4 0%,#fbfcfb 45%,#f7faf8 100%)!important}
      .message{gap:7px!important;margin-bottom:11px!important}
      .message>.avatar{width:27px!important;height:27px!important;flex-basis:27px!important;border-radius:9px!important;background:#dceee8!important}
      .bubble{max-width:calc(100% - 34px)!important}
      .bubble-card{padding:10px 11px!important;border-color:#d8e4df!important;border-radius:5px 14px 14px 14px!important;box-shadow:0 4px 14px rgba(10,54,57,.055)!important;font-size:11.5px!important;line-height:1.48!important}
      .answer-title{font-size:12.5px!important;color:#123f45!important}
      .message.me .bubble-card{background:linear-gradient(135deg,#0a3b48,#0b5661)!important;border-radius:14px 5px 14px 14px!important}
      .source{font-size:9.5px!important;margin-top:8px!important;padding-top:7px!important}
      .actions{margin-top:2px!important}.mini{font-size:9px!important}
      .composer{padding:9px 10px 10px!important;background:#fff!important}
      .input-wrap{gap:5px!important;padding:5px!important;border-color:#c8d9d3!important;border-radius:13px!important;background:#f8faf9!important}
      .composer textarea{min-height:34px!important;padding:7px 5px!important;font-size:12px!important}
      .mic,.send{width:34px!important;height:34px!important;flex-basis:34px!important;border-radius:10px!important}
      .mic{background:#e0f0eb!important;color:#0b706e!important}.send{background:#0a4653!important}
      .hint{font-size:8.5px!important;padding-top:4px!important}
      .contact-action,.launch-action{padding:7px 9px!important;font-size:10px!important}
      .sassy-aside{font-size:10.5px!important}
      @media(max-width:760px){
        .assistant{inset:0!important;width:100%!important;height:100%!important;border:0!important;border-radius:0!important}
        .launcher{right:12px!important;bottom:12px!important}
      }
    `;
    doc.head.appendChild(style);

    const heading = doc.querySelector('.chat-heading strong');
    if (heading) heading.textContent = 'Enrique';
    const firstTitle = doc.querySelector('.message.ai .answer-title');
    if (firstTitle) firstTitle.textContent = 'Hi, I’m Enrique — your TBRN assistant.';
  };

  frame.addEventListener('load', modernise);
  if (frame.contentDocument?.readyState === 'complete') modernise();
})();
