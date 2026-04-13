import{j as e}from"./jsx-runtime-Z5uAzocK.js";import{r as D}from"./index-pP6CS22B.js";import{B as V}from"./Button-BDYnqn9u.js";import"./_commonjsHelpers-Cpj98o6Y.js";function c({open:a,onClose:t,title:r,children:s,size:_="md",className:q=""}){const u=D.useId();if(!a)return null;const w=["modal-dialog",`modal-dialog-${_}`,q].filter(Boolean).join(" ");return e.jsxs("div",{className:"modal-root",children:[e.jsx("button",{type:"button",className:"modal-backdrop","aria-label":"Close modal",onClick:t}),e.jsxs("div",{className:w,role:"dialog","aria-modal":"true","aria-labelledby":r?u:void 0,children:[r&&e.jsxs("header",{className:"modal-header",children:[e.jsx("h2",{id:u,className:"modal-title",children:r}),e.jsx("button",{type:"button",className:"modal-close","aria-label":"Close modal",onClick:t,children:e.jsx("span",{"aria-hidden":"true",children:"×"})})]}),e.jsx("div",{className:"modal-body",children:s})]})]})}try{c.displayName="Modal",c.__docgenInfo={description:`Modal — centered dialog with backdrop.

Renders only when \`open\` is true. Uses fixed positioning with a backdrop —
no portal. Sets role="dialog", aria-modal="true", and aria-labelledby on
the title. Token-only styling, light + dark via data-theme="dark".`,displayName:"Modal",props:{open:{defaultValue:null,description:"Whether the modal is currently open and rendered",name:"open",required:!0,type:{name:"boolean"}},onClose:{defaultValue:null,description:"Callback fired when the user requests close (backdrop click or close button)",name:"onClose",required:!0,type:{name:"() => void"}},title:{defaultValue:null,description:"Optional title rendered in the modal header",name:"title",required:!1,type:{name:"string"}},children:{defaultValue:null,description:"Modal body content",name:"children",required:!0,type:{name:"ReactNode"}},size:{defaultValue:{value:"md"},description:"Size variant — controls the modal dialog width",name:"size",required:!1,type:{name:"enum",value:[{value:'"sm"'},{value:'"md"'},{value:'"lg"'}]}},className:{defaultValue:{value:""},description:"Additional CSS class names for the dialog element",name:"className",required:!1,type:{name:"string"}}}}}catch{}const A={title:"Layout/Modal",component:c,parameters:{layout:"fullscreen",docs:{description:{component:'Centered dialog with backdrop. role="dialog" aria-modal="true" aria-labelledby on title.'}}},tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg"]}}};function o({size:a,title:t}){const[r,s]=D.useState(!0);return e.jsxs("div",{className:"modal-demo-wrap",children:[e.jsx(V,{variant:"primary",onClick:()=>s(!0),children:"Open modal"}),e.jsxs(c,{open:r,onClose:()=>s(!1),title:t,size:a,children:[e.jsx("p",{children:"This is the modal body content."}),e.jsx("p",{children:"Use modals for confirmations, short forms, or focused decisions."})]})]})}const d={render:()=>e.jsx(o,{title:"Confirm action",size:"md"})},l={render:()=>e.jsx(o,{title:"Small modal",size:"sm"})},n={render:()=>e.jsx(o,{title:"Large modal",size:"lg"})},i={render:()=>e.jsx(o,{size:"md"})},m={render:()=>e.jsx(o,{title:"Confirm action",size:"md"}),parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[a=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(a,{}))]};var p,h,f;d.parameters={...d.parameters,docs:{...(p=d.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => <ModalDemo title="Confirm action" size="md" />
}`,...(f=(h=d.parameters)==null?void 0:h.docs)==null?void 0:f.source}}};var g,y,b;l.parameters={...l.parameters,docs:{...(g=l.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <ModalDemo title="Small modal" size="sm" />
}`,...(b=(y=l.parameters)==null?void 0:y.docs)==null?void 0:b.source}}};var x,k,j;n.parameters={...n.parameters,docs:{...(x=n.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <ModalDemo title="Large modal" size="lg" />
}`,...(j=(k=n.parameters)==null?void 0:k.docs)==null?void 0:j.source}}};var S,v,N;i.parameters={...i.parameters,docs:{...(S=i.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <ModalDemo size="md" />
}`,...(N=(v=i.parameters)==null?void 0:v.docs)==null?void 0:N.source}}};var z,C,M;m.parameters={...m.parameters,docs:{...(z=m.parameters)==null?void 0:z.docs,source:{originalSource:`{
  render: () => <ModalDemo title="Confirm action" size="md" />,
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
}`,...(M=(C=m.parameters)==null?void 0:C.docs)==null?void 0:M.source}}};const B=["Default","Small","Large","NoTitle","DarkMode"];export{m as DarkMode,d as Default,n as Large,i as NoTitle,l as Small,B as __namedExportsOrder,A as default};
