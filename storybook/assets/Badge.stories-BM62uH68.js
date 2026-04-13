import{j as e}from"./jsx-runtime-Z5uAzocK.js";import{A as g}from"./Avatar-CuCyrOgL.js";import"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";const W=99;function B(r,n){return r>n?`${n}+`:String(r)}function a({count:r,max:n=W,dot:o=!1,tone:K="default",children:f,className:h=""}){const x=f!=null,v=o||typeof r=="number"&&r>0,j=["badge-indicator",`badge-tone-${K}`,o?"badge-dot":"badge-count",x?"badge-anchored":"badge-inline"].join(" "),b=o?"Notification":typeof r=="number"?`${r} notifications`:"Badge";if(x){const Q=["badge-wrapper",h].filter(Boolean).join(" ");return e.jsxs("span",{className:Q,children:[f,v&&e.jsx("span",{className:j,role:"status","aria-label":b,children:!o&&typeof r=="number"&&e.jsx("span",{className:"badge-text",children:B(r,n)})})]})}if(!v)return null;const P=[j,h].filter(Boolean).join(" ");return e.jsx("span",{className:P,role:"status","aria-label":b,children:!o&&typeof r=="number"&&e.jsx("span",{className:"badge-text",children:B(r,n)})})}try{a.displayName="Badge",a.__docgenInfo={description:`Badge — generic numeric/count overlay (distinct from StatusBadge for HR statuses).

Token-only styling, light + dark via data-theme="dark". Used standalone as an
inline pill, or wrapping a child to anchor the badge to its top-right corner.`,displayName:"Badge",props:{count:{defaultValue:null,description:"Numeric count to display. Ignored when `dot` is true.",name:"count",required:!1,type:{name:"number"}},max:{defaultValue:{value:"99"},description:'Maximum count before showing "{max}+". Defaults to 99.',name:"max",required:!1,type:{name:"number"}},dot:{defaultValue:{value:"false"},description:"Render a small dot instead of a count.",name:"dot",required:!1,type:{name:"boolean"}},tone:{defaultValue:{value:"default"},description:"Visual tone",name:"tone",required:!1,type:{name:"enum",value:[{value:'"success"'},{value:'"warning"'},{value:'"info"'},{value:'"default"'},{value:'"error"'}]}},children:{defaultValue:null,description:"Optional anchor child — badge is overlaid on its top-right corner.",name:"children",required:!1,type:{name:"ReactNode"}},className:{defaultValue:{value:""},description:"Additional CSS class names",name:"className",required:!1,type:{name:"string"}}}}}catch{}const ne={title:"Data/Badge",component:a,parameters:{layout:"padded",docs:{description:{component:"Badge — generic numeric/count overlay. Distinct from StatusBadge (which is for HR status taxonomies). Token-only."}}},tags:["autodocs"]},t={args:{count:5,tone:"error"}},s={args:{count:12,tone:"info"}},c={args:{count:250,max:99,tone:"error"}},d={args:{dot:!0,tone:"success"}},i={render:()=>e.jsx(a,{count:3,tone:"error",children:e.jsx(g,{name:"Marie Dupont",size:"large"})})},u={render:()=>e.jsx(a,{dot:!0,tone:"success",children:e.jsx(g,{name:"Jean Martin",size:"large"})})},l={render:()=>e.jsxs("div",{className:"stories-row",children:[e.jsx(a,{count:1,tone:"default"}),e.jsx(a,{count:2,tone:"info"}),e.jsx(a,{count:3,tone:"success"}),e.jsx(a,{count:4,tone:"warning"}),e.jsx(a,{count:5,tone:"error"})]})},m={args:{count:0,tone:"error"}},p={render:()=>e.jsxs("div",{className:"stories-row",children:[e.jsx(a,{count:5,tone:"error",children:e.jsx(g,{name:"Marie Dupont",size:"large"})}),e.jsx(a,{dot:!0,tone:"success",children:e.jsx(g,{name:"Jean Martin",size:"large"})}),e.jsx(a,{count:42,tone:"info"})]}),parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[r=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(r,{}))]};var y,w,A;t.parameters={...t.parameters,docs:{...(y=t.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    count: 5,
    tone: 'error'
  }
}`,...(A=(w=t.parameters)==null?void 0:w.docs)==null?void 0:A.source}}};var D,S,N;s.parameters={...s.parameters,docs:{...(D=s.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    count: 12,
    tone: 'info'
  }
}`,...(N=(S=s.parameters)==null?void 0:S.docs)==null?void 0:N.source}}};var k,M,_;c.parameters={...c.parameters,docs:{...(k=c.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    count: 250,
    max: 99,
    tone: 'error'
  }
}`,...(_=(M=c.parameters)==null?void 0:M.docs)==null?void 0:_.source}}};var z,C,V;d.parameters={...d.parameters,docs:{...(z=d.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    dot: true,
    tone: 'success'
  }
}`,...(V=(C=d.parameters)==null?void 0:C.docs)==null?void 0:V.source}}};var q,I,E;i.parameters={...i.parameters,docs:{...(q=i.parameters)==null?void 0:q.docs,source:{originalSource:`{
  render: () => <Badge count={3} tone="error">\r
      <Avatar name="Marie Dupont" size="large" />\r
    </Badge>
}`,...(E=(I=i.parameters)==null?void 0:I.docs)==null?void 0:E.source}}};var R,T,H;u.parameters={...u.parameters,docs:{...(R=u.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => <Badge dot tone="success">\r
      <Avatar name="Jean Martin" size="large" />\r
    </Badge>
}`,...(H=(T=u.parameters)==null?void 0:T.docs)==null?void 0:H.source}}};var J,O,$;l.parameters={...l.parameters,docs:{...(J=l.parameters)==null?void 0:J.docs,source:{originalSource:`{
  render: () => <div className="stories-row">\r
      <Badge count={1} tone="default" />\r
      <Badge count={2} tone="info" />\r
      <Badge count={3} tone="success" />\r
      <Badge count={4} tone="warning" />\r
      <Badge count={5} tone="error" />\r
    </div>
}`,...($=(O=l.parameters)==null?void 0:O.docs)==null?void 0:$.source}}};var U,Z,F;m.parameters={...m.parameters,docs:{...(U=m.parameters)==null?void 0:U.docs,source:{originalSource:`{
  args: {
    count: 0,
    tone: 'error'
  }
}`,...(F=(Z=m.parameters)==null?void 0:Z.docs)==null?void 0:F.source}}};var L,X,G;p.parameters={...p.parameters,docs:{...(L=p.parameters)==null?void 0:L.docs,source:{originalSource:`{
  render: () => <div className="stories-row">\r
      <Badge count={5} tone="error">\r
        <Avatar name="Marie Dupont" size="large" />\r
      </Badge>\r
      <Badge dot tone="success">\r
        <Avatar name="Jean Martin" size="large" />\r
      </Badge>\r
      <Badge count={42} tone="info" />\r
    </div>,
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
}`,...(G=(X=p.parameters)==null?void 0:X.docs)==null?void 0:G.source}}};const oe=["Default","Inline","OverflowMax","Dot","AnchoredCount","AnchoredDot","Tones","ZeroIsHidden","DarkMode"];export{i as AnchoredCount,u as AnchoredDot,p as DarkMode,t as Default,d as Dot,s as Inline,c as OverflowMax,l as Tones,m as ZeroIsHidden,oe as __namedExportsOrder,ne as default};
