import{j as e}from"./jsx-runtime-Z5uAzocK.js";import"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function d({title:s,description:c,tone:l="info",icon:u,onDismiss:m}){const E=l==="error"||l==="warning"?"alert":"status",T=["alert",`alert-${l}`].join(" ");return e.jsxs("div",{className:T,role:E,children:[u&&e.jsx("span",{className:"alert-icon","aria-hidden":"true",children:u}),e.jsxs("div",{className:"alert-body",children:[e.jsx("p",{className:"alert-title",children:s}),c&&e.jsx("p",{className:"alert-description",children:c})]}),m&&e.jsx("button",{type:"button",className:"alert-dismiss",onClick:m,"aria-label":"Dismiss",children:e.jsx("svg",{className:"alert-dismiss-icon",viewBox:"0 0 24 24","aria-hidden":"true",focusable:"false",children:e.jsx("path",{d:"M6 6 L18 18 M18 6 L6 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",fill:"none"})})})]})}try{d.displayName="Alert",d.__docgenInfo={description:`Alert — inline persistent message.

Uses role="alert" for warning/error tones (assertive) and role="status"
for info/success (polite). Token-only styling, light + dark.`,displayName:"Alert",props:{title:{defaultValue:null,description:"Alert title — primary message",name:"title",required:!0,type:{name:"string"}},description:{defaultValue:null,description:"Optional description — supporting body text",name:"description",required:!1,type:{name:"string"}},tone:{defaultValue:{value:"info"},description:"Visual tone — defaults to 'info'",name:"tone",required:!1,type:{name:"enum",value:[{value:'"success"'},{value:'"warning"'},{value:'"info"'},{value:'"error"'}]}},icon:{defaultValue:null,description:"Optional leading icon node",name:"icon",required:!1,type:{name:"ReactNode"}},onDismiss:{defaultValue:null,description:"Called when the dismiss button is clicked. Omit to render a non-dismissable alert.",name:"onDismiss",required:!1,type:{name:"(() => void)"}}}}}catch{}const P={title:"Feedback/Alert",component:d,parameters:{layout:"padded",docs:{description:{component:'Inline persistent message. Uses role="alert" for warning/error and role="status" for info/success.'}}},tags:["autodocs"],argTypes:{tone:{control:"select",options:["info","success","warning","error"]}}},r={args:{title:"Heads up",description:"This is an informational message.",tone:"info"}},t={args:{title:"Profile updated",description:"Your changes have been saved.",tone:"success"}},a={args:{title:"Approaching limit",description:"You have used 80% of your monthly quota.",tone:"warning"}},n={args:{title:"Validation failed",description:"Please fix the highlighted fields and try again.",tone:"error"}},i={args:{title:"Dismissable alert",description:"Click the dismiss icon to remove this alert.",tone:"info",onDismiss:()=>{}}},o={args:{title:"Heads up",description:"This is an informational message.",tone:"info"},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[s=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(s,{}))]};var p,f,g;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    title: 'Heads up',
    description: 'This is an informational message.',
    tone: 'info'
  }
}`,...(g=(f=r.parameters)==null?void 0:f.docs)==null?void 0:g.source}}};var h,y,v;t.parameters={...t.parameters,docs:{...(h=t.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    title: 'Profile updated',
    description: 'Your changes have been saved.',
    tone: 'success'
  }
}`,...(v=(y=t.parameters)==null?void 0:y.docs)==null?void 0:v.source}}};var k,b,x;a.parameters={...a.parameters,docs:{...(k=a.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    title: 'Approaching limit',
    description: 'You have used 80% of your monthly quota.',
    tone: 'warning'
  }
}`,...(x=(b=a.parameters)==null?void 0:b.docs)==null?void 0:x.source}}};var j,A,D;n.parameters={...n.parameters,docs:{...(j=n.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    title: 'Validation failed',
    description: 'Please fix the highlighted fields and try again.',
    tone: 'error'
  }
}`,...(D=(A=n.parameters)==null?void 0:A.docs)==null?void 0:D.source}}};var N,S,_;i.parameters={...i.parameters,docs:{...(N=i.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    title: 'Dismissable alert',
    description: 'Click the dismiss icon to remove this alert.',
    tone: 'info',
    onDismiss: () => undefined
  }
}`,...(_=(S=i.parameters)==null?void 0:S.docs)==null?void 0:_.source}}};var w,V,q;o.parameters={...o.parameters,docs:{...(w=o.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    title: 'Heads up',
    description: 'This is an informational message.',
    tone: 'info'
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
}`,...(q=(V=o.parameters)==null?void 0:V.docs)==null?void 0:q.source}}};const Y=["Default","Success","Warning","Error","Dismissable","DarkMode"];export{o as DarkMode,r as Default,i as Dismissable,n as Error,t as Success,a as Warning,Y as __namedExportsOrder,P as default};
