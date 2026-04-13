import{j as e}from"./jsx-runtime-Z5uAzocK.js";import{r as I}from"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function c({title:a,subtitle:i,actions:l,footer:u,padding:q="default",bordered:B=!0,children:V,className:A=""}){const p=I.useId(),H=!!(a||i||l),D=["card",`card-padding-${q}`,B?"card-bordered":"card-borderless",A].filter(Boolean).join(" ");return e.jsxs("section",{className:D,"aria-labelledby":a?p:void 0,children:[H&&e.jsxs("header",{className:"card-header",children:[e.jsxs("div",{className:"card-header-text",children:[a&&e.jsx("h3",{id:p,className:"card-title",children:a}),i&&e.jsx("p",{className:"card-subtitle",children:i})]}),l&&e.jsx("div",{className:"card-actions",children:l})]}),e.jsx("div",{className:"card-body",children:V}),u&&e.jsx("footer",{className:"card-footer",children:u})]})}try{c.displayName="Card",c.__docgenInfo={description:`Card — surface container with optional header (title + subtitle + actions),
body, and optional footer.

Token-only styling, light + dark via data-theme="dark". When a title is
provided the card is wired with aria-labelledby.`,displayName:"Card",props:{title:{defaultValue:null,description:"Optional title rendered in the card header",name:"title",required:!1,type:{name:"string"}},subtitle:{defaultValue:null,description:"Optional subtitle rendered below the title",name:"subtitle",required:!1,type:{name:"string"}},actions:{defaultValue:null,description:"Optional actions slot — typically buttons aligned to the right of the header",name:"actions",required:!1,type:{name:"ReactNode"}},footer:{defaultValue:null,description:"Optional footer slot rendered below the body",name:"footer",required:!1,type:{name:"ReactNode"}},padding:{defaultValue:{value:"default"},description:"Internal padding scale applied to header, body, and footer",name:"padding",required:!1,type:{name:"enum",value:[{value:'"small"'},{value:'"large"'},{value:'"none"'},{value:'"default"'}]}},bordered:{defaultValue:{value:"true"},description:"Whether the card renders a border (default true)",name:"bordered",required:!1,type:{name:"boolean"}},children:{defaultValue:null,description:"Card body content",name:"children",required:!0,type:{name:"ReactNode"}},className:{defaultValue:{value:""},description:"Additional CSS class names for the root element",name:"className",required:!1,type:{name:"string"}}}}}catch{}const F={title:"Layout/Card",component:c,parameters:{layout:"padded",docs:{description:{component:"Surface container with optional header (title, subtitle, actions slot), body, and optional footer."}}},tags:["autodocs"]},r={args:{title:"Candidate summary",subtitle:"Last updated 2 hours ago",children:e.jsx("p",{children:"Surface container body content with token-only styling."})}},t={args:{title:"Job posting",subtitle:"Senior backend engineer — Paris",actions:e.jsx("button",{type:"button","aria-label":"Open menu",children:"Edit"}),footer:e.jsx("span",{children:"Last reviewed by Hatim"}),children:e.jsx("p",{children:"Card body with header actions and footer slot populated."})}},d={args:{title:"Borderless card",bordered:!1,children:e.jsx("p",{children:"No outer border, only the surface shadow."})}},o={args:{title:"Spacious card",subtitle:"Large padding scale",padding:"large",children:e.jsx("p",{children:"Generous internal spacing for hero-style surfaces."})}},n={args:{children:e.jsx("p",{children:"Card with no header or footer — just a padded body."})}},s={args:{title:"Candidate summary",subtitle:"Last updated 2 hours ago",actions:e.jsx("button",{type:"button","aria-label":"Open menu",children:"Edit"}),footer:e.jsx("span",{children:"Last reviewed by Hatim"}),children:e.jsx("p",{children:"Surface container body content rendered in dark theme."})},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[a=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(a,{}))]};var m,h,b;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    title: 'Candidate summary',
    subtitle: 'Last updated 2 hours ago',
    children: <p>Surface container body content with token-only styling.</p>
  }
}`,...(b=(h=r.parameters)==null?void 0:h.docs)==null?void 0:b.source}}};var f,y,g;t.parameters={...t.parameters,docs:{...(f=t.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    title: 'Job posting',
    subtitle: 'Senior backend engineer — Paris',
    actions: <button type="button" aria-label="Open menu">\r
        Edit\r
      </button>,
    footer: <span>Last reviewed by Hatim</span>,
    children: <p>Card body with header actions and footer slot populated.</p>
  }
}`,...(g=(y=t.parameters)==null?void 0:y.docs)==null?void 0:g.source}}};var x,j,k;d.parameters={...d.parameters,docs:{...(x=d.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    title: 'Borderless card',
    bordered: false,
    children: <p>No outer border, only the surface shadow.</p>
  }
}`,...(k=(j=d.parameters)==null?void 0:j.docs)==null?void 0:k.source}}};var S,v,w;o.parameters={...o.parameters,docs:{...(S=o.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    title: 'Spacious card',
    subtitle: 'Large padding scale',
    padding: 'large',
    children: <p>Generous internal spacing for hero-style surfaces.</p>
  }
}`,...(w=(v=o.parameters)==null?void 0:v.docs)==null?void 0:w.source}}};var N,C,L;n.parameters={...n.parameters,docs:{...(N=n.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    children: <p>Card with no header or footer — just a padded body.</p>
  }
}`,...(L=(C=n.parameters)==null?void 0:C.docs)==null?void 0:L.source}}};var O,_,E;s.parameters={...s.parameters,docs:{...(O=s.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    title: 'Candidate summary',
    subtitle: 'Last updated 2 hours ago',
    actions: <button type="button" aria-label="Open menu">\r
        Edit\r
      </button>,
    footer: <span>Last reviewed by Hatim</span>,
    children: <p>Surface container body content rendered in dark theme.</p>
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
}`,...(E=(_=s.parameters)==null?void 0:_.docs)==null?void 0:E.source}}};const G=["Default","WithActionsAndFooter","Borderless","LargePadding","BodyOnly","DarkMode"];export{n as BodyOnly,d as Borderless,s as DarkMode,r as Default,o as LargePadding,t as WithActionsAndFooter,G as __namedExportsOrder,F as default};
