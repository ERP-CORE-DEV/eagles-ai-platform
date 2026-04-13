import{j as e}from"./jsx-runtime-Z5uAzocK.js";import"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function t({variant:a="rect",width:c,height:p,className:N=""}){const b=["skeleton",`skeleton-${a}`,N].filter(Boolean).join(" "),d={};return c&&(d["--skeleton-width"]=c),p&&(d["--skeleton-height"]=p),e.jsx("span",{className:b,role:"presentation","aria-hidden":"true",style:d})}try{t.displayName="Skeleton",t.__docgenInfo={description:`Skeleton — loading placeholder with shimmer animation.

Token-only styling, light + dark via data-theme="dark". Width and height
are forwarded via CSS custom properties so the component never embeds
raw color values via inline style.`,displayName:"Skeleton",props:{variant:{defaultValue:{value:"rect"},description:"Shape variant — defaults to 'rect'",name:"variant",required:!1,type:{name:"enum",value:[{value:'"text"'},{value:'"circle"'},{value:'"rect"'}]}},width:{defaultValue:null,description:"Width — any valid CSS length (e.g. '100%', '120px'). Optional.",name:"width",required:!1,type:{name:"string"}},height:{defaultValue:null,description:"Height — any valid CSS length (e.g. '16px', '4rem'). Optional.",name:"height",required:!1,type:{name:"string"}},className:{defaultValue:{value:""},description:"Additional CSS class names",name:"className",required:!1,type:{name:"string"}}}}}catch{}const E={title:"Feedback/Skeleton",component:t,parameters:{layout:"padded",docs:{description:{component:"Loading placeholder with shimmer animation. Use while async content is loading to reduce perceived wait."}}},tags:["autodocs"],argTypes:{variant:{control:"select",options:["text","rect","circle"]}}},r={args:{variant:"rect",width:"320px",height:"120px"}},n={args:{variant:"text",width:"240px",height:"14px"}},i={args:{variant:"circle",width:"48px",height:"48px"}},s={render:()=>e.jsxs("div",{className:"stories-stack",children:[e.jsx(t,{variant:"circle",width:"56px",height:"56px"}),e.jsx(t,{variant:"text",width:"220px",height:"14px"}),e.jsx(t,{variant:"text",width:"180px",height:"14px"}),e.jsx(t,{variant:"rect",width:"320px",height:"120px"})]})},o={args:{variant:"rect",width:"320px",height:"120px"},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[a=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(a,{}))]};var l,h,m;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    variant: 'rect',
    width: '320px',
    height: '120px'
  }
}`,...(m=(h=r.parameters)==null?void 0:h.docs)==null?void 0:m.source}}};var u,x,g;n.parameters={...n.parameters,docs:{...(u=n.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    variant: 'text',
    width: '240px',
    height: '14px'
  }
}`,...(g=(x=n.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var v,k,f;i.parameters={...i.parameters,docs:{...(v=i.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    variant: 'circle',
    width: '48px',
    height: '48px'
  }
}`,...(f=(k=i.parameters)==null?void 0:k.docs)==null?void 0:f.source}}};var S,w,y;s.parameters={...s.parameters,docs:{...(S=s.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <div className="stories-stack">\r
      <Skeleton variant="circle" width="56px" height="56px" />\r
      <Skeleton variant="text" width="220px" height="14px" />\r
      <Skeleton variant="text" width="180px" height="14px" />\r
      <Skeleton variant="rect" width="320px" height="120px" />\r
    </div>
}`,...(y=(w=s.parameters)==null?void 0:w.docs)==null?void 0:y.source}}};var j,_,C;o.parameters={...o.parameters,docs:{...(j=o.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    variant: 'rect',
    width: '320px',
    height: '120px'
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
}`,...(C=(_=o.parameters)==null?void 0:_.docs)==null?void 0:C.source}}};const T=["Default","Text","Circle","Composition","DarkMode"];export{i as Circle,s as Composition,o as DarkMode,r as Default,n as Text,T as __namedExportsOrder,E as default};
