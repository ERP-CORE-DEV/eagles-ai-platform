import{j as a}from"./jsx-runtime-Z5uAzocK.js";import"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function u(e){if(e!==void 0)return typeof e=="number"?`${e}px`:e}function c({maxHeight:e,maxWidth:r,children:v,className:V=""}){const W=["scroll-area",V].filter(Boolean).join(" "),i={},m=u(e),h=u(r);return m&&(i["--scroll-area-max-height"]=m),h&&(i["--scroll-area-max-width"]=h),a.jsx("div",{className:W,style:i,tabIndex:0,role:"region",children:v})}try{c.displayName="ScrollArea",c.__docgenInfo={description:`ScrollArea — scrollable wrapper with optional max-height/max-width and
token-styled scrollbars.

Token-only styling, light + dark via data-theme="dark". Uses CSS custom
properties (--scroll-area-max-height / --scroll-area-max-width) supplied
through a single-brace style object so the size is themable from the call
site without inline color or numeric literals in CSS.`,displayName:"ScrollArea",props:{maxHeight:{defaultValue:null,description:"Maximum height before vertical scrolling — accepts any CSS length or number (px)",name:"maxHeight",required:!1,type:{name:"string | number"}},maxWidth:{defaultValue:null,description:"Maximum width before horizontal scrolling — accepts any CSS length or number (px)",name:"maxWidth",required:!1,type:{name:"string | number"}},children:{defaultValue:null,description:"Scrollable content",name:"children",required:!0,type:{name:"ReactNode"}},className:{defaultValue:{value:""},description:"Additional CSS class names for the root element",name:"className",required:!1,type:{name:"string"}}}}}catch{}const E={title:"Layout/ScrollArea",component:c,parameters:{layout:"padded",docs:{description:{component:"Scrollable wrapper with optional max-height and max-width and token-styled scrollbars."}}},tags:["autodocs"]},d=Array.from({length:30},(e,r)=>a.jsxs("p",{children:["Line ",r+1," — scrollable content rendered inside the ScrollArea wrapper to demonstrate token-styled scrollbars and overflow handling."]},r)),T=a.jsx("div",{className:"scroll-area-demo-wide",children:Array.from({length:20},(e,r)=>a.jsxs("span",{className:"scroll-area-demo-wide-cell",children:["Column ",r+1]},r))}),t={args:{maxHeight:240,children:d}},n={args:{maxHeight:"320px",children:d}},o={args:{maxWidth:400,children:T}},s={args:{maxHeight:200,maxWidth:400,children:a.jsx("div",{className:"scroll-area-demo-grid",children:Array.from({length:60},(e,r)=>a.jsxs("span",{className:"scroll-area-demo-grid-cell",children:["Cell ",r+1]},r))})}},l={args:{maxHeight:240,children:d},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[e=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),a.jsx(e,{}))]};var p,g,x;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    maxHeight: 240,
    children: longText
  }
}`,...(x=(g=t.parameters)==null?void 0:g.docs)==null?void 0:x.source}}};var f,y,S;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    maxHeight: '320px',
    children: longText
  }
}`,...(S=(y=n.parameters)==null?void 0:y.docs)==null?void 0:S.source}}};var b,k,w;o.parameters={...o.parameters,docs:{...(b=o.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    maxWidth: 400,
    children: wideContent
  }
}`,...(w=(k=o.parameters)==null?void 0:k.docs)==null?void 0:w.source}}};var A,H,_;s.parameters={...s.parameters,docs:{...(A=s.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    maxHeight: 200,
    maxWidth: 400,
    children: <div className="scroll-area-demo-grid">\r
        {Array.from({
        length: 60
      }, (_, i) => <span key={i} className="scroll-area-demo-grid-cell">\r
            Cell {i + 1}\r
          </span>)}\r
      </div>
  }
}`,...(_=(H=s.parameters)==null?void 0:H.docs)==null?void 0:_.source}}};var N,j,C;l.parameters={...l.parameters,docs:{...(N=l.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    maxHeight: 240,
    children: longText
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
}`,...(C=(j=l.parameters)==null?void 0:j.docs)==null?void 0:C.source}}};const M=["Default","FixedHeightString","HorizontalScroll","BothAxes","DarkMode"];export{s as BothAxes,l as DarkMode,t as Default,n as FixedHeightString,o as HorizontalScroll,M as __namedExportsOrder,E as default};
