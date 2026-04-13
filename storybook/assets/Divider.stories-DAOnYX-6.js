import{j as e}from"./jsx-runtime-Z5uAzocK.js";import"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function l({orientation:a="horizontal",label:d,spacing:V="default",className:L=""}){const c=["divider",`divider-${a}`,`divider-spacing-${V}`,d?"divider-with-label":"",L].filter(Boolean).join(" ");return d&&a==="horizontal"?e.jsxs("div",{className:c,role:"separator","aria-orientation":"horizontal",children:[e.jsx("span",{className:"divider-line","aria-hidden":"true"}),e.jsx("span",{className:"divider-label",children:d}),e.jsx("span",{className:"divider-line","aria-hidden":"true"})]}):a==="vertical"?e.jsx("span",{className:c,role:"separator","aria-orientation":"vertical"}):e.jsx("hr",{className:c})}try{l.displayName="Divider",l.__docgenInfo={description:`Divider — horizontal or vertical separator with optional centered label.

Token-only styling, light + dark via data-theme="dark". When a label is
provided the root uses role="separator" with aria-orientation; otherwise
a semantic <hr> is rendered for horizontal mode.`,displayName:"Divider",props:{orientation:{defaultValue:{value:"horizontal"},description:"Orientation — horizontal (default) or vertical",name:"orientation",required:!1,type:{name:"enum",value:[{value:'"horizontal"'},{value:'"vertical"'}]}},label:{defaultValue:null,description:"Optional centered label rendered inline (horizontal only)",name:"label",required:!1,type:{name:"string"}},spacing:{defaultValue:{value:"default"},description:"Margin scale around the divider",name:"spacing",required:!1,type:{name:"enum",value:[{value:'"small"'},{value:'"large"'},{value:'"default"'}]}},className:{defaultValue:{value:""},description:"Additional CSS class names for the root element",name:"className",required:!1,type:{name:"string"}}}}}catch{}const M={title:"Layout/Divider",component:l,parameters:{layout:"padded",docs:{description:{component:"Horizontal or vertical separator with optional centered label. Token-only styling."}}},tags:["autodocs"]},r={args:{orientation:"horizontal"}},n={args:{orientation:"horizontal",label:"or continue with"}},t={render:a=>e.jsxs("div",{style:R,children:[e.jsx("span",{children:"Left"}),e.jsx(l,{...a}),e.jsx("span",{children:"Right"})]}),args:{orientation:"vertical"}},o={args:{orientation:"horizontal",spacing:"small",label:"tight"}},i={args:{orientation:"horizontal",spacing:"large",label:"roomy"}},s={args:{orientation:"horizontal",label:"or continue with"},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[a=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(a,{}))]},R={display:"flex",flexDirection:"row",alignItems:"center",height:"var(--spacing-32)"};var p,u,m;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal'
  }
}`,...(m=(u=r.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var h,g,v;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal',
    label: 'or continue with'
  }
}`,...(v=(g=n.parameters)==null?void 0:g.docs)==null?void 0:v.source}}};var f,y,b;t.parameters={...t.parameters,docs:{...(f=t.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: args => <div style={cssVarsRowStyle}>\r
      <span>Left</span>\r
      <Divider {...args} />\r
      <span>Right</span>\r
    </div>,
  args: {
    orientation: 'vertical'
  }
}`,...(b=(y=t.parameters)==null?void 0:y.docs)==null?void 0:b.source}}};var z,S,x;o.parameters={...o.parameters,docs:{...(z=o.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal',
    spacing: 'small',
    label: 'tight'
  }
}`,...(x=(S=o.parameters)==null?void 0:S.docs)==null?void 0:x.source}}};var j,k,w;i.parameters={...i.parameters,docs:{...(j=i.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal',
    spacing: 'large',
    label: 'roomy'
  }
}`,...(w=(k=i.parameters)==null?void 0:k.docs)==null?void 0:w.source}}};var D,N,_;s.parameters={...s.parameters,docs:{...(D=s.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal',
    label: 'or continue with'
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
}`,...(_=(N=s.parameters)==null?void 0:N.docs)==null?void 0:_.source}}};const O=["Default","WithLabel","Vertical","SmallSpacing","LargeSpacing","DarkMode"];export{s as DarkMode,r as Default,i as LargeSpacing,o as SmallSpacing,t as Vertical,n as WithLabel,O as __namedExportsOrder,M as default};
