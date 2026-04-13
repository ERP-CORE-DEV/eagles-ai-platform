import{j as e}from"./jsx-runtime-Z5uAzocK.js";import"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function o({sidebar:a,header:d,children:k,className:C=""}){const v=["app-shell",a?"app-shell-with-sidebar":"",d?"app-shell-with-header":"",C].filter(Boolean).join(" ");return e.jsxs("div",{className:v,children:[a&&e.jsx("aside",{className:"app-shell-sidebar","aria-label":"Primary navigation",children:a}),e.jsxs("div",{className:"app-shell-body",children:[d&&e.jsx("header",{className:"app-shell-header",children:d}),e.jsx("main",{className:"app-shell-main",children:k})]})]})}try{o.displayName="AppShell",o.__docgenInfo={description:`AppShell — top-level page shell with sidebar, header, and main content slots.

Provides the canonical layout grid for full application screens. Token-only
styling, light + dark via data-theme="dark".`,displayName:"AppShell",props:{sidebar:{defaultValue:null,description:"Optional sidebar slot — typically a navigation component",name:"sidebar",required:!1,type:{name:"ReactNode"}},header:{defaultValue:null,description:"Optional header slot — typically a top bar with branding and actions",name:"header",required:!1,type:{name:"ReactNode"}},children:{defaultValue:null,description:"Main content area children",name:"children",required:!0,type:{name:"ReactNode"}},className:{defaultValue:{value:""},description:"Additional CSS class names for the root element",name:"className",required:!1,type:{name:"string"}}}}}catch{}const E={title:"Layout/AppShell",component:o,parameters:{layout:"fullscreen",docs:{description:{component:"Top-level page shell with sidebar slot, header slot, and main content area."}}},tags:["autodocs"]},i=e.jsxs("nav",{className:"app-shell-demo-nav",children:[e.jsx("span",{className:"app-shell-demo-brand",children:"EAGLES"}),e.jsx("a",{className:"app-shell-demo-link",href:"#dashboard",children:"Dashboard"}),e.jsx("a",{className:"app-shell-demo-link",href:"#candidates",children:"Candidates"}),e.jsx("a",{className:"app-shell-demo-link",href:"#jobs",children:"Jobs"})]}),c=e.jsxs("div",{className:"app-shell-demo-header",children:[e.jsx("span",{className:"app-shell-demo-title",children:"Recruitment Console"}),e.jsx("span",{className:"app-shell-demo-user",children:"Hatim H."})]}),l=e.jsxs("div",{className:"app-shell-demo-main",children:[e.jsx("h1",{children:"Welcome"}),e.jsx("p",{children:"This is the main content area of the AppShell."})]}),n={args:{sidebar:i,header:c,children:l}},r={args:{header:c,children:l}},s={args:{sidebar:i,children:l}},t={args:{sidebar:i,header:c,children:l},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[a=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(a,{}))]};var p,m,h;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    sidebar: sidebarContent,
    header: headerContent,
    children: mainContent
  }
}`,...(h=(m=n.parameters)==null?void 0:m.docs)==null?void 0:h.source}}};var u,b,f;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    header: headerContent,
    children: mainContent
  }
}`,...(f=(b=r.parameters)==null?void 0:b.docs)==null?void 0:f.source}}};var y,g,j;s.parameters={...s.parameters,docs:{...(y=s.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    sidebar: sidebarContent,
    children: mainContent
  }
}`,...(j=(g=s.parameters)==null?void 0:g.docs)==null?void 0:j.source}}};var x,N,S;t.parameters={...t.parameters,docs:{...(x=t.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    sidebar: sidebarContent,
    header: headerContent,
    children: mainContent
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
}`,...(S=(N=t.parameters)==null?void 0:N.docs)==null?void 0:S.source}}};const w=["Default","HeaderOnly","SidebarOnly","DarkMode"];export{t as DarkMode,n as Default,r as HeaderOnly,s as SidebarOnly,w as __namedExportsOrder,E as default};
