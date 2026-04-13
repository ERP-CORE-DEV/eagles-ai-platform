import{j as e}from"./jsx-runtime-Z5uAzocK.js";import{r as W}from"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function u({title:s,description:l,tone:E="info",onClose:t,duration:c=5e3}){W.useEffect(()=>{if(c<=0||!t)return;const q=window.setTimeout(t,c);return()=>window.clearTimeout(q)},[c,t]);const V=["toast",`toast-${E}`].join(" ");return e.jsxs("div",{className:V,role:"status","aria-live":"polite",children:[e.jsxs("div",{className:"toast-body",children:[e.jsx("p",{className:"toast-title",children:s}),l&&e.jsx("p",{className:"toast-description",children:l})]}),t&&e.jsx("button",{type:"button",className:"toast-close",onClick:t,"aria-label":"Close notification",children:e.jsx("svg",{className:"toast-close-icon",viewBox:"0 0 24 24","aria-hidden":"true",focusable:"false",children:e.jsx("path",{d:"M6 6 L18 18 M18 6 L6 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",fill:"none"})})})]})}try{u.displayName="Toast",u.__docgenInfo={description:'Toast — transient notification.\n\nToken-only styling, light + dark via data-theme="dark". Auto-dismisses\nafter `duration` ms (default 5000). Set `duration={0}` to disable.',displayName:"Toast",props:{title:{defaultValue:null,description:"Toast title — primary message",name:"title",required:!0,type:{name:"string"}},description:{defaultValue:null,description:"Optional description — supporting text below the title",name:"description",required:!1,type:{name:"string"}},tone:{defaultValue:{value:"info"},description:"Visual tone — defaults to 'info'",name:"tone",required:!1,type:{name:"enum",value:[{value:'"success"'},{value:'"warning"'},{value:'"info"'},{value:'"error"'}]}},onClose:{defaultValue:null,description:"Called when the close button is clicked or the auto-dismiss timer fires",name:"onClose",required:!1,type:{name:"(() => void)"}},duration:{defaultValue:{value:"5000"},description:"Auto-dismiss duration in ms. 0 disables auto-dismiss. Defaults to 5000.",name:"duration",required:!1,type:{name:"number"}}}}}catch{}const F={title:"Feedback/Toast",component:u,parameters:{layout:"padded",docs:{description:{component:'Transient notification with role="status" and optional auto-dismiss. Use for non-blocking confirmation feedback.'}}},tags:["autodocs"],argTypes:{tone:{control:"select",options:["info","success","warning","error"]},duration:{control:{type:"number",min:0,step:500}}}},o={args:{title:"Saved successfully",description:"Your changes have been recorded.",tone:"info",duration:0}},r={args:{title:"Candidate approved",description:"The candidate has been moved to the next stage.",tone:"success",duration:0}},a={args:{title:"Quota nearly reached",description:"90% of monthly job postings consumed.",tone:"warning",duration:0}},n={args:{title:"Failed to save",description:"Network error. Please try again.",tone:"error",duration:0}},i={args:{title:"Dismissable toast",description:"Click the close icon to dismiss.",tone:"info",duration:0,onClose:()=>{}}},d={args:{title:"Saved successfully",description:"Your changes have been recorded.",tone:"info",duration:0},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[s=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(s,{}))]};var m,p,f;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    title: 'Saved successfully',
    description: 'Your changes have been recorded.',
    tone: 'info',
    duration: 0
  }
}`,...(f=(p=o.parameters)==null?void 0:p.docs)==null?void 0:f.source}}};var g,h,y;r.parameters={...r.parameters,docs:{...(g=r.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    title: 'Candidate approved',
    description: 'The candidate has been moved to the next stage.',
    tone: 'success',
    duration: 0
  }
}`,...(y=(h=r.parameters)==null?void 0:h.docs)==null?void 0:y.source}}};var v,b,k;a.parameters={...a.parameters,docs:{...(v=a.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    title: 'Quota nearly reached',
    description: '90% of monthly job postings consumed.',
    tone: 'warning',
    duration: 0
  }
}`,...(k=(b=a.parameters)==null?void 0:b.docs)==null?void 0:k.source}}};var x,S,w;n.parameters={...n.parameters,docs:{...(x=n.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    title: 'Failed to save',
    description: 'Network error. Please try again.',
    tone: 'error',
    duration: 0
  }
}`,...(w=(S=n.parameters)==null?void 0:S.docs)==null?void 0:w.source}}};var j,T,N;i.parameters={...i.parameters,docs:{...(j=i.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    title: 'Dismissable toast',
    description: 'Click the close icon to dismiss.',
    tone: 'info',
    duration: 0,
    onClose: () => undefined
  }
}`,...(N=(T=i.parameters)==null?void 0:T.docs)==null?void 0:N.source}}};var _,D,C;d.parameters={...d.parameters,docs:{...(_=d.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    title: 'Saved successfully',
    description: 'Your changes have been recorded.',
    tone: 'info',
    duration: 0
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    },
    theme: 'dark'
  },
  decorators: [Story => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    return <Story />;
  }]
}`,...(C=(D=d.parameters)==null?void 0:D.docs)==null?void 0:C.source}}};const L=["Default","Success","Warning","Error","WithDismiss","DarkMode"];export{d as DarkMode,o as Default,n as Error,r as Success,a as Warning,i as WithDismiss,L as __namedExportsOrder,F as default};
