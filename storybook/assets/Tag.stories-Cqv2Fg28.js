import{j as e}from"./jsx-runtime-Z5uAzocK.js";import"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function r({children:a,tone:P="default",size:W="default",className:$=""}){const O=["tag",`tag-${P}`,`tag-${W}`,$].filter(Boolean).join(" ");return e.jsx("span",{className:O,children:a})}try{r.displayName="Tag",r.__docgenInfo={description:`Tag — small non-interactive label pill.

Token-only styling, light + dark via data-theme="dark".`,displayName:"Tag",props:{children:{defaultValue:null,description:"Tag label content",name:"children",required:!0,type:{name:"ReactNode"}},tone:{defaultValue:{value:"default"},description:"Visual tone",name:"tone",required:!1,type:{name:"enum",value:[{value:'"success"'},{value:'"warning"'},{value:'"info"'},{value:'"default"'},{value:'"error"'},{value:'"neutral"'}]}},size:{defaultValue:{value:"default"},description:"Size variant",name:"size",required:!1,type:{name:"enum",value:[{value:'"small"'},{value:'"default"'}]}},className:{defaultValue:{value:""},description:"Additional CSS class names",name:"className",required:!1,type:{name:"string"}}}}}catch{}const J={title:"Data/Tag",component:r,parameters:{layout:"padded",docs:{description:{component:"Tag — small non-interactive label pill. Token-only, light + dark."}}},tags:["autodocs"],argTypes:{tone:{control:"select",options:["default","info","success","warning","error","neutral"]},size:{control:"select",options:["small","default"]}}},n={args:{children:"CDI",tone:"default"}},t={args:{children:"Nouveau",tone:"info"}},s={args:{children:"Approuvé",tone:"success"}},o={args:{children:"En attente",tone:"warning"}},c={args:{children:"Rejeté",tone:"error"}},l={args:{children:"Brouillon",tone:"neutral"}},d={args:{children:"Petit",tone:"info",size:"small"}},i={render:()=>e.jsxs("div",{className:"stories-row",children:[e.jsx(r,{tone:"default",children:"default"}),e.jsx(r,{tone:"neutral",children:"neutral"}),e.jsx(r,{tone:"info",children:"info"}),e.jsx(r,{tone:"success",children:"success"}),e.jsx(r,{tone:"warning",children:"warning"}),e.jsx(r,{tone:"error",children:"error"})]})},u={args:{children:"CDI",tone:"default"},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[a=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(a,{}))]};var m,p,g;n.parameters={...n.parameters,docs:{...(m=n.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    children: 'CDI',
    tone: 'default'
  }
}`,...(g=(p=n.parameters)==null?void 0:p.docs)==null?void 0:g.source}}};var f,h,v;t.parameters={...t.parameters,docs:{...(f=t.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    children: 'Nouveau',
    tone: 'info'
  }
}`,...(v=(h=t.parameters)==null?void 0:h.docs)==null?void 0:v.source}}};var T,S,y;s.parameters={...s.parameters,docs:{...(T=s.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    children: 'Approuvé',
    tone: 'success'
  }
}`,...(y=(S=s.parameters)==null?void 0:S.docs)==null?void 0:y.source}}};var k,j,x;o.parameters={...o.parameters,docs:{...(k=o.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    children: 'En attente',
    tone: 'warning'
  }
}`,...(x=(j=o.parameters)==null?void 0:j.docs)==null?void 0:x.source}}};var N,w,_;c.parameters={...c.parameters,docs:{...(N=c.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    children: 'Rejeté',
    tone: 'error'
  }
}`,...(_=(w=c.parameters)==null?void 0:w.docs)==null?void 0:_.source}}};var D,E,b;l.parameters={...l.parameters,docs:{...(D=l.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    children: 'Brouillon',
    tone: 'neutral'
  }
}`,...(b=(E=l.parameters)==null?void 0:E.docs)==null?void 0:b.source}}};var A,I,z;d.parameters={...d.parameters,docs:{...(A=d.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    children: 'Petit',
    tone: 'info',
    size: 'small'
  }
}`,...(z=(I=d.parameters)==null?void 0:I.docs)==null?void 0:z.source}}};var C,V,q;i.parameters={...i.parameters,docs:{...(C=i.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => <div className="stories-row">\r
      <Tag tone="default">default</Tag>\r
      <Tag tone="neutral">neutral</Tag>\r
      <Tag tone="info">info</Tag>\r
      <Tag tone="success">success</Tag>\r
      <Tag tone="warning">warning</Tag>\r
      <Tag tone="error">error</Tag>\r
    </div>
}`,...(q=(V=i.parameters)==null?void 0:V.docs)==null?void 0:q.source}}};var R,B,M;u.parameters={...u.parameters,docs:{...(R=u.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    children: 'CDI',
    tone: 'default'
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
}`,...(M=(B=u.parameters)==null?void 0:B.docs)==null?void 0:M.source}}};const K=["Default","Info","Success","Warning","Error","Neutral","Small","AllTones","DarkMode"];export{i as AllTones,u as DarkMode,n as Default,c as Error,t as Info,l as Neutral,d as Small,s as Success,o as Warning,K as __namedExportsOrder,J as default};
