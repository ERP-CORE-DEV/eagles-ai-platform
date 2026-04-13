import{j as e}from"./jsx-runtime-Z5uAzocK.js";import"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function J(a,s){if(s<=0)return 0;const r=a/s*100;return Number.isNaN(r)||r<0?0:r>100?100:r}function v({value:a,max:s=100,size:r="medium",tone:R="default",label:n,showValue:f=!1,className:U=""}){const g=J(a,s),F=`${Math.round(g)}%`,G=["progress",`progress-${r}`,`progress-tone-${R}`,U].filter(Boolean).join(" "),H={"--progress-fill-width":`${g}%`};return e.jsxs("div",{className:G,children:[(n||f)&&e.jsxs("div",{className:"progress-header",children:[n&&e.jsx("span",{className:"progress-label",children:n}),f&&e.jsx("span",{className:"progress-value",children:F})]}),e.jsx("div",{className:"progress-track",role:"progressbar","aria-valuenow":Math.round(g),"aria-valuemin":0,"aria-valuemax":100,"aria-label":n??"Progress",children:e.jsx("div",{className:"progress-fill",style:H})})]})}try{v.displayName="Progress",v.__docgenInfo={description:'Progress — linear progress bar.\n\nToken-only styling, light + dark via data-theme="dark". Uses\n`role="progressbar"` with `aria-valuenow`/`aria-valuemin`/`aria-valuemax`\nfor assistive technology.',displayName:"Progress",props:{value:{defaultValue:null,description:"Current value, between 0 and `max`.",name:"value",required:!0,type:{name:"number"}},max:{defaultValue:{value:"100"},description:"Maximum value. Defaults to 100.",name:"max",required:!1,type:{name:"number"}},size:{defaultValue:{value:"medium"},description:"Visual size — defaults to 'medium'",name:"size",required:!1,type:{name:"enum",value:[{value:'"small"'},{value:'"medium"'},{value:'"large"'}]}},tone:{defaultValue:{value:"default"},description:"Visual tone — defaults to 'default' (action primary)",name:"tone",required:!1,type:{name:"enum",value:[{value:'"success"'},{value:'"warning"'},{value:'"default"'},{value:'"error"'}]}},label:{defaultValue:null,description:"Optional label rendered above the bar",name:"label",required:!1,type:{name:"string"}},showValue:{defaultValue:{value:"false"},description:"Show numeric percentage value next to the label",name:"showValue",required:!1,type:{name:"boolean"}},className:{defaultValue:{value:""},description:"Additional CSS class names",name:"className",required:!1,type:{name:"string"}}}}}catch{}const Z={title:"Data/Progress",component:v,parameters:{layout:"padded",docs:{description:{component:"Progress — linear progress bar with optional label, percentage, and tone variants. Token-only."}}},tags:["autodocs"]},t={args:{value:60,label:"Profil complété",showValue:!0}},o={args:{value:35,size:"small"}},l={args:{value:80,size:"large",label:"Téléchargement",showValue:!0}},u={args:{value:100,tone:"success",label:"Validation",showValue:!0}},c={args:{value:65,tone:"warning",label:"Quota utilisé",showValue:!0}},i={args:{value:92,tone:"error",label:"Espace disque",showValue:!0}},d={args:{value:0,label:"En attente"}},m={args:{value:7,max:10,label:"Étapes",showValue:!0}},p={args:{value:60,label:"Profil complété",showValue:!0},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[a=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(a,{}))]};var h,b,V;t.parameters={...t.parameters,docs:{...(h=t.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    value: 60,
    label: 'Profil complété',
    showValue: true
  }
}`,...(V=(b=t.parameters)==null?void 0:b.docs)==null?void 0:V.source}}};var w,y,x;o.parameters={...o.parameters,docs:{...(w=o.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    value: 35,
    size: 'small'
  }
}`,...(x=(y=o.parameters)==null?void 0:y.docs)==null?void 0:x.source}}};var S,k,N;l.parameters={...l.parameters,docs:{...(S=l.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    value: 80,
    size: 'large',
    label: 'Téléchargement',
    showValue: true
  }
}`,...(N=(k=l.parameters)==null?void 0:k.docs)==null?void 0:N.source}}};var P,j,E;u.parameters={...u.parameters,docs:{...(P=u.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    value: 100,
    tone: 'success',
    label: 'Validation',
    showValue: true
  }
}`,...(E=(j=u.parameters)==null?void 0:j.docs)==null?void 0:E.source}}};var _,q,z;c.parameters={...c.parameters,docs:{...(_=c.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    value: 65,
    tone: 'warning',
    label: 'Quota utilisé',
    showValue: true
  }
}`,...(z=(q=c.parameters)==null?void 0:q.docs)==null?void 0:z.source}}};var M,D,T;i.parameters={...i.parameters,docs:{...(M=i.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    value: 92,
    tone: 'error',
    label: 'Espace disque',
    showValue: true
  }
}`,...(T=(D=i.parameters)==null?void 0:D.docs)==null?void 0:T.source}}};var C,$,A;d.parameters={...d.parameters,docs:{...(C=d.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    value: 0,
    label: 'En attente'
  }
}`,...(A=($=d.parameters)==null?void 0:$.docs)==null?void 0:A.source}}};var I,L,O;m.parameters={...m.parameters,docs:{...(I=m.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    value: 7,
    max: 10,
    label: 'Étapes',
    showValue: true
  }
}`,...(O=(L=m.parameters)==null?void 0:L.docs)==null?void 0:O.source}}};var Q,W,B;p.parameters={...p.parameters,docs:{...(Q=p.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  args: {
    value: 60,
    label: 'Profil complété',
    showValue: true
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
}`,...(B=(W=p.parameters)==null?void 0:W.docs)==null?void 0:B.source}}};const ee=["Default","Small","Large","Success","Warning","ErrorTone","Indeterminate","CustomMax","DarkMode"];export{m as CustomMax,p as DarkMode,t as Default,i as ErrorTone,d as Indeterminate,l as Large,o as Small,u as Success,c as Warning,ee as __namedExportsOrder,Z as default};
