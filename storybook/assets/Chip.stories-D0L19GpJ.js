import{j as a}from"./jsx-runtime-Z5uAzocK.js";import{fn as e}from"./index-DgAF9SIF.js";import"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function r({label:o,onRemove:n,tone:Q="default",disabled:b=!1,className:$=""}){const O=["chip",`chip-${Q}`,b?"chip-disabled":"",n?"chip-removable":"",$].filter(Boolean).join(" "),z=()=>{!b&&n&&n()};return a.jsxs("span",{className:O,children:[a.jsx("span",{className:"chip-label",children:o}),n&&a.jsx("button",{type:"button",className:"chip-remove","aria-label":`Remove ${o}`,onClick:z,disabled:b,children:a.jsx("svg",{className:"chip-remove-icon",viewBox:"0 0 16 16","aria-hidden":"true",focusable:"false",children:a.jsx("path",{d:"M4 4 L12 12 M12 4 L4 12",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",fill:"none"})})})]})}try{r.displayName="Chip",r.__docgenInfo={description:`Chip — interactive pill with optional close button.

Token-only styling, light + dark via data-theme="dark".`,displayName:"Chip",props:{label:{defaultValue:null,description:"Chip label text",name:"label",required:!0,type:{name:"string"}},onRemove:{defaultValue:null,description:'When provided, renders a remove button with aria-label="Remove {label}"',name:"onRemove",required:!1,type:{name:"(() => void)"}},tone:{defaultValue:{value:"default"},description:"Visual tone",name:"tone",required:!1,type:{name:"enum",value:[{value:'"primary"'},{value:'"success"'},{value:'"warning"'},{value:'"default"'},{value:'"error"'}]}},disabled:{defaultValue:{value:"false"},description:"Disabled state — blocks interaction",name:"disabled",required:!1,type:{name:"boolean"}},className:{defaultValue:{value:""},description:"Additional CSS class names",name:"className",required:!1,type:{name:"string"}}}}}catch{}const U={title:"Data/Chip",component:r,parameters:{layout:"padded",docs:{description:{component:"Chip — interactive pill with optional close button. Token-only, light + dark."}}},tags:["autodocs"],argTypes:{tone:{control:"select",options:["default","primary","success","warning","error"]},disabled:{control:"boolean"}},args:{onRemove:e()}},s={args:{label:"React",tone:"default",onRemove:e()}},t={args:{label:"TypeScript",tone:"primary",onRemove:e()}},l={args:{label:"Validé",tone:"success",onRemove:e()}},i={args:{label:"À revoir",tone:"warning",onRemove:e()}},c={args:{label:"Bloqué",tone:"error",onRemove:e()}},d={args:{label:"CDI",tone:"primary"}},m={args:{label:"Indisponible",tone:"default",disabled:!0,onRemove:e()}},p={render:()=>a.jsxs("div",{className:"stories-row",children:[a.jsx(r,{label:"React",tone:"primary",onRemove:e()}),a.jsx(r,{label:"TypeScript",tone:"primary",onRemove:e()}),a.jsx(r,{label:"Node.js",tone:"primary",onRemove:e()}),a.jsx(r,{label:"GraphQL",tone:"primary",onRemove:e()}),a.jsx(r,{label:"Docker",tone:"primary",onRemove:e()})]})},u={args:{label:"React",tone:"default",onRemove:e()},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[o=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),a.jsx(o,{}))]};var f,v,g;s.parameters={...s.parameters,docs:{...(f=s.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    label: 'React',
    tone: 'default',
    onRemove: fn()
  }
}`,...(g=(v=s.parameters)==null?void 0:v.docs)==null?void 0:g.source}}};var h,y,R;t.parameters={...t.parameters,docs:{...(h=t.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    label: 'TypeScript',
    tone: 'primary',
    onRemove: fn()
  }
}`,...(R=(y=t.parameters)==null?void 0:y.docs)==null?void 0:R.source}}};var k,S,x;l.parameters={...l.parameters,docs:{...(k=l.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    label: 'Validé',
    tone: 'success',
    onRemove: fn()
  }
}`,...(x=(S=l.parameters)==null?void 0:S.docs)==null?void 0:x.source}}};var j,C,N;i.parameters={...i.parameters,docs:{...(j=i.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    label: 'À revoir',
    tone: 'warning',
    onRemove: fn()
  }
}`,...(N=(C=i.parameters)==null?void 0:C.docs)==null?void 0:N.source}}};var D,w,_;c.parameters={...c.parameters,docs:{...(D=c.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    label: 'Bloqué',
    tone: 'error',
    onRemove: fn()
  }
}`,...(_=(w=c.parameters)==null?void 0:w.docs)==null?void 0:_.source}}};var T,V,q;d.parameters={...d.parameters,docs:{...(T=d.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    label: 'CDI',
    tone: 'primary'
  }
}`,...(q=(V=d.parameters)==null?void 0:V.docs)==null?void 0:q.source}}};var L,E,I;m.parameters={...m.parameters,docs:{...(L=m.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    label: 'Indisponible',
    tone: 'default',
    disabled: true,
    onRemove: fn()
  }
}`,...(I=(E=m.parameters)==null?void 0:E.docs)==null?void 0:I.source}}};var B,M,W;p.parameters={...p.parameters,docs:{...(B=p.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <div className="stories-row">\r
      <Chip label="React" tone="primary" onRemove={fn()} />\r
      <Chip label="TypeScript" tone="primary" onRemove={fn()} />\r
      <Chip label="Node.js" tone="primary" onRemove={fn()} />\r
      <Chip label="GraphQL" tone="primary" onRemove={fn()} />\r
      <Chip label="Docker" tone="primary" onRemove={fn()} />\r
    </div>
}`,...(W=(M=p.parameters)==null?void 0:M.docs)==null?void 0:W.source}}};var A,G,P;u.parameters={...u.parameters,docs:{...(A=u.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    label: 'React',
    tone: 'default',
    onRemove: fn()
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
}`,...(P=(G=u.parameters)==null?void 0:G.docs)==null?void 0:P.source}}};const X=["Default","Primary","Success","Warning","ErrorTone","NonRemovable","Disabled","SkillList","DarkMode"];export{u as DarkMode,s as Default,m as Disabled,c as ErrorTone,d as NonRemovable,t as Primary,p as SkillList,l as Success,i as Warning,X as __namedExportsOrder,U as default};
