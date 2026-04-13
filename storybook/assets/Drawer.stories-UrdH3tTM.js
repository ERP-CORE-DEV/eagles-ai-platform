import{j as e}from"./jsx-runtime-Z5uAzocK.js";import{r as C}from"./index-pP6CS22B.js";import{B as L}from"./Button-BDYnqn9u.js";import"./_commonjsHelpers-Cpj98o6Y.js";function m({open:r,onClose:d,title:a,children:s,width:q="md",className:V=""}){const u=C.useId();if(!r)return null;const E=["drawer-panel",`drawer-panel-${q}`,V].filter(Boolean).join(" ");return e.jsxs("div",{className:"drawer-root",children:[e.jsx("button",{type:"button",className:"drawer-backdrop","aria-label":"Close drawer",onClick:d}),e.jsxs("div",{className:E,role:"dialog","aria-modal":"true","aria-labelledby":a?u:void 0,children:[a&&e.jsxs("header",{className:"drawer-header",children:[e.jsx("h2",{id:u,className:"drawer-title",children:a}),e.jsx("button",{type:"button",className:"drawer-close","aria-label":"Close drawer",onClick:d,children:e.jsx("span",{"aria-hidden":"true",children:"×"})})]}),e.jsx("div",{className:"drawer-body",children:s})]})]})}try{m.displayName="Drawer",m.__docgenInfo={description:`Drawer — side sheet that slides in from the right.

Renders only when \`open\` is true. Uses fixed positioning with a backdrop —
no portal. Sets role="dialog" and aria-modal="true". Token-only styling,
light + dark via data-theme="dark".`,displayName:"Drawer",props:{open:{defaultValue:null,description:"Whether the drawer is currently open and rendered",name:"open",required:!0,type:{name:"boolean"}},onClose:{defaultValue:null,description:"Callback fired when the user requests close (backdrop click or close button)",name:"onClose",required:!0,type:{name:"() => void"}},title:{defaultValue:null,description:"Optional title rendered in the drawer header",name:"title",required:!1,type:{name:"string"}},children:{defaultValue:null,description:"Drawer body content",name:"children",required:!0,type:{name:"ReactNode"}},width:{defaultValue:{value:"md"},description:"Width variant — controls the drawer panel size",name:"width",required:!1,type:{name:"enum",value:[{value:'"sm"'},{value:'"md"'},{value:'"lg"'}]}},className:{defaultValue:{value:""},description:"Additional CSS class names for the drawer panel",name:"className",required:!1,type:{name:"string"}}}}}catch{}const I={title:"Layout/Drawer",component:m,parameters:{layout:"fullscreen",docs:{description:{component:'Side sheet that slides in from the right with backdrop. role="dialog" aria-modal="true".'}}},tags:["autodocs"],argTypes:{width:{control:"select",options:["sm","md","lg"]}}};function t({width:r,title:d}){const[a,s]=C.useState(!0);return e.jsxs("div",{className:"drawer-demo-wrap",children:[e.jsx(L,{variant:"primary",onClick:()=>s(!0),children:"Open drawer"}),e.jsxs(m,{open:a,onClose:()=>s(!1),title:d,width:r,children:[e.jsx("p",{children:"This is the drawer body content."}),e.jsx("p",{children:"You can put forms, details, or any content here."})]})]})}const o={render:()=>e.jsx(t,{title:"Drawer title",width:"md"})},n={render:()=>e.jsx(t,{title:"Small drawer",width:"sm"})},l={render:()=>e.jsx(t,{title:"Large drawer",width:"lg"})},i={render:()=>e.jsx(t,{width:"md"})},c={render:()=>e.jsx(t,{title:"Drawer title",width:"md"}),parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[r=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(r,{}))]};var p,h,w;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => <DrawerDemo title="Drawer title" width="md" />
}`,...(w=(h=o.parameters)==null?void 0:h.docs)==null?void 0:w.source}}};var f,g,y;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <DrawerDemo title="Small drawer" width="sm" />
}`,...(y=(g=n.parameters)==null?void 0:g.docs)==null?void 0:y.source}}};var D,x,b;l.parameters={...l.parameters,docs:{...(D=l.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => <DrawerDemo title="Large drawer" width="lg" />
}`,...(b=(x=l.parameters)==null?void 0:x.docs)==null?void 0:b.source}}};var j,k,S;i.parameters={...i.parameters,docs:{...(j=i.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: () => <DrawerDemo width="md" />
}`,...(S=(k=i.parameters)==null?void 0:k.docs)==null?void 0:S.source}}};var v,N,_;c.parameters={...c.parameters,docs:{...(v=c.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => <DrawerDemo title="Drawer title" width="md" />,
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
}`,...(_=(N=c.parameters)==null?void 0:N.docs)==null?void 0:_.source}}};const R=["Default","Small","Large","NoTitle","DarkMode"];export{c as DarkMode,o as Default,l as Large,i as NoTitle,n as Small,R as __namedExportsOrder,I as default};
