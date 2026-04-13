import{j as e}from"./jsx-runtime-Z5uAzocK.js";import{r as w}from"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function i({title:t,kicker:d,description:s,children:j,padded:N=!0,className:_=""}){const c=w.useId(),U=["section",N?"section-padded":"",_].filter(Boolean).join(" ");return e.jsxs("section",{className:U,"aria-labelledby":c,children:[e.jsxs("header",{className:"section-header",children:[d&&e.jsx("p",{className:"section-kicker",children:d}),e.jsx("h2",{id:c,className:"section-title",children:t}),s&&e.jsx("p",{className:"section-description",children:s})]}),e.jsx("div",{className:"section-body",children:j})]})}try{i.displayName="Section",i.__docgenInfo={description:`Section — labeled content section with kicker, title, description, and body.

Provides semantic <section> grouping with accessible labelled-by wiring.
Token-only styling, light + dark via data-theme="dark".`,displayName:"Section",props:{title:{defaultValue:null,description:"Section title — rendered as the heading",name:"title",required:!0,type:{name:"string"}},kicker:{defaultValue:null,description:"Optional kicker text rendered above the title (e.g., category)",name:"kicker",required:!1,type:{name:"string"}},description:{defaultValue:null,description:"Optional description rendered below the title",name:"description",required:!1,type:{name:"string"}},children:{defaultValue:null,description:"Section content",name:"children",required:!0,type:{name:"ReactNode"}},padded:{defaultValue:{value:"true"},description:"Whether the content area has internal padding (default true)",name:"padded",required:!1,type:{name:"boolean"}},className:{defaultValue:{value:""},description:"Additional CSS class names for the root element",name:"className",required:!1,type:{name:"string"}}}}}catch{}const T={title:"Layout/Section",component:i,parameters:{layout:"padded",docs:{description:{component:"Labeled content section with optional kicker, title, description, and padded body."}}},tags:["autodocs"]},n={args:{title:"Profile information",children:e.jsx("p",{children:"Update your personal details and contact information here."})}},a={args:{kicker:"Account",title:"Profile information",description:"These details appear on your public profile.",children:e.jsx("p",{children:"Update your personal details and contact information here."})}},r={args:{title:"Data table",description:"Edge-to-edge content area without internal padding.",padded:!1,children:e.jsx("p",{children:"Table content stretched to the section edges."})}},o={args:{kicker:"Account",title:"Profile information",description:"These details appear on your public profile.",children:e.jsx("p",{children:"Update your personal details and contact information here."})},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[t=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(t,{}))]};var l,p,u;n.parameters={...n.parameters,docs:{...(l=n.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    title: 'Profile information',
    children: <p>Update your personal details and contact information here.</p>
  }
}`,...(u=(p=n.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var m,h,f;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    kicker: 'Account',
    title: 'Profile information',
    description: 'These details appear on your public profile.',
    children: <p>Update your personal details and contact information here.</p>
  }
}`,...(f=(h=a.parameters)==null?void 0:h.docs)==null?void 0:f.source}}};var g,y,k;r.parameters={...r.parameters,docs:{...(g=r.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    title: 'Data table',
    description: 'Edge-to-edge content area without internal padding.',
    padded: false,
    children: <p>Table content stretched to the section edges.</p>
  }
}`,...(k=(y=r.parameters)==null?void 0:y.docs)==null?void 0:k.source}}};var b,x,S;o.parameters={...o.parameters,docs:{...(b=o.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    kicker: 'Account',
    title: 'Profile information',
    description: 'These details appear on your public profile.',
    children: <p>Update your personal details and contact information here.</p>
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
}`,...(S=(x=o.parameters)==null?void 0:x.docs)==null?void 0:S.source}}};const q=["Default","WithKicker","Unpadded","DarkMode"];export{o as DarkMode,n as Default,r as Unpadded,a as WithKicker,q as __namedExportsOrder,T as default};
