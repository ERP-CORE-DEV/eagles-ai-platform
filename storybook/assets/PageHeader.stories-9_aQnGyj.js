import{j as e}from"./jsx-runtime-Z5uAzocK.js";import{B as a}from"./Button-BDYnqn9u.js";import"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function o({title:t,subtitle:c,actions:l,breadcrumb:u,className:S=""}){const _=["page-header",S].filter(Boolean).join(" ");return e.jsxs("div",{className:_,children:[u&&e.jsx("div",{className:"page-header-breadcrumb",children:u}),e.jsxs("div",{className:"page-header-row",children:[e.jsxs("div",{className:"page-header-text",children:[e.jsx("h1",{className:"page-header-title",children:t}),c&&e.jsx("p",{className:"page-header-subtitle",children:c})]}),l&&e.jsx("div",{className:"page-header-actions",children:l})]})]})}try{o.displayName="PageHeader",o.__docgenInfo={description:`PageHeader — title, subtitle, breadcrumb, and actions slot for top-of-page composition.

Token-only styling, light + dark via data-theme="dark".`,displayName:"PageHeader",props:{title:{defaultValue:null,description:"Main page title",name:"title",required:!0,type:{name:"string"}},subtitle:{defaultValue:null,description:"Optional subtitle rendered below the title",name:"subtitle",required:!1,type:{name:"string"}},actions:{defaultValue:null,description:"Optional actions slot — typically buttons aligned to the right",name:"actions",required:!1,type:{name:"ReactNode"}},breadcrumb:{defaultValue:null,description:"Optional breadcrumb slot rendered above the title",name:"breadcrumb",required:!1,type:{name:"ReactNode"}},className:{defaultValue:{value:""},description:"Additional CSS class names for the root element",name:"className",required:!1,type:{name:"string"}}}}}catch{}const q={title:"Layout/PageHeader",component:o,parameters:{layout:"padded",docs:{description:{component:"Page-level header with title, subtitle, optional breadcrumb, and optional actions slot."}}},tags:["autodocs"]},r={args:{title:"Candidates",subtitle:"Manage your active candidate pipeline"}},i={args:{title:"Candidates",subtitle:"Manage your active candidate pipeline",actions:e.jsxs(e.Fragment,{children:[e.jsx(a,{variant:"secondary",children:"Export"}),e.jsx(a,{variant:"primary",children:"New candidate"})]})}},n={args:{title:"Edit candidate",subtitle:"Update profile information",breadcrumb:e.jsx("span",{children:"Candidates / Jane Doe / Edit"})}},s={args:{title:"Edit candidate",subtitle:"Update profile information",breadcrumb:e.jsx("span",{children:"Candidates / Jane Doe / Edit"}),actions:e.jsxs(e.Fragment,{children:[e.jsx(a,{variant:"secondary",children:"Cancel"}),e.jsx(a,{variant:"primary",children:"Save"})]})}},d={args:{title:"Candidates",subtitle:"Manage your active candidate pipeline",actions:e.jsxs(e.Fragment,{children:[e.jsx(a,{variant:"secondary",children:"Export"}),e.jsx(a,{variant:"primary",children:"New candidate"})]})},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[t=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(t,{}))]};var p,m,g;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    title: 'Candidates',
    subtitle: 'Manage your active candidate pipeline'
  }
}`,...(g=(m=r.parameters)==null?void 0:m.docs)==null?void 0:g.source}}};var h,b,y;i.parameters={...i.parameters,docs:{...(h=i.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    title: 'Candidates',
    subtitle: 'Manage your active candidate pipeline',
    actions: <>\r
        <Button variant="secondary">Export</Button>\r
        <Button variant="primary">New candidate</Button>\r
      </>
  }
}`,...(y=(b=i.parameters)==null?void 0:b.docs)==null?void 0:y.source}}};var f,v,x;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    title: 'Edit candidate',
    subtitle: 'Update profile information',
    breadcrumb: <span>Candidates / Jane Doe / Edit</span>
  }
}`,...(x=(v=n.parameters)==null?void 0:v.docs)==null?void 0:x.source}}};var j,B,N;s.parameters={...s.parameters,docs:{...(j=s.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    title: 'Edit candidate',
    subtitle: 'Update profile information',
    breadcrumb: <span>Candidates / Jane Doe / Edit</span>,
    actions: <>\r
        <Button variant="secondary">Cancel</Button>\r
        <Button variant="primary">Save</Button>\r
      </>
  }
}`,...(N=(B=s.parameters)==null?void 0:B.docs)==null?void 0:N.source}}};var E,k,C;d.parameters={...d.parameters,docs:{...(E=d.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    title: 'Candidates',
    subtitle: 'Manage your active candidate pipeline',
    actions: <>\r
        <Button variant="secondary">Export</Button>\r
        <Button variant="primary">New candidate</Button>\r
      </>
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
}`,...(C=(k=d.parameters)==null?void 0:k.docs)==null?void 0:C.source}}};const A=["Default","WithActions","WithBreadcrumb","Full","DarkMode"];export{d as DarkMode,r as Default,s as Full,i as WithActions,n as WithBreadcrumb,A as __namedExportsOrder,q as default};
