import{j as r}from"./jsx-runtime-Z5uAzocK.js";import{r as f}from"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function t({size:o="medium",invalid:p=!1,autoResize:s=!1,className:J="",value:b,defaultValue:h,onChange:m,...L}){const e=f.useRef(null);f.useEffect(()=>{if(!s)return;const a=e.current;a&&(a.style.height="auto",a.style.height=`${a.scrollHeight}px`)},[s,b,h]);const A=["textarea",`textarea-${o}`,p?"textarea-invalid":"",s?"textarea-auto-resize":"",J].filter(Boolean).join(" ");return r.jsx("textarea",{ref:e,className:A,"aria-invalid":p?"true":void 0,value:b,defaultValue:h,onChange:a=>{s&&e.current&&(e.current.style.height="auto",e.current.style.height=`${e.current.scrollHeight}px`),m==null||m(a)},...L})}try{t.displayName="Textarea",t.__docgenInfo={description:`Textarea — standalone multiline input.

Has no built-in label. Consumers must provide either an \`aria-label\`
or wrap this component in a FormField. Forwards all native textarea props.`,displayName:"Textarea",props:{size:{defaultValue:{value:"medium"},description:"Size variant",name:"size",required:!1,type:{name:"enum",value:[{value:'"small"'},{value:'"medium"'},{value:'"large"'}]}},invalid:{defaultValue:{value:"false"},description:"Marks the textarea as invalid (sets aria-invalid + error border)",name:"invalid",required:!1,type:{name:"boolean"}},autoResize:{defaultValue:{value:"false"},description:"Auto-grow height to fit content",name:"autoResize",required:!1,type:{name:"boolean"}}}}}catch{}const $={title:"Forms/Textarea",component:t,parameters:{layout:"padded",docs:{description:{component:"Standalone multiline input. Wrap in FormField for label + hint, or pass `aria-label` directly."}}},tags:["autodocs"],argTypes:{size:{control:"select",options:["small","medium","large"]},invalid:{control:"boolean"},autoResize:{control:"boolean"},disabled:{control:"boolean"}}},l={args:{"aria-label":"Job description",placeholder:"Describe the role…",name:"description",rows:5}},n={args:{"aria-label":"Job description",placeholder:"Describe the role…",invalid:!0,defaultValue:"too short"}},i={args:{"aria-label":"Notes",placeholder:"Type to grow…",autoResize:!0,defaultValue:"This textarea grows as you type."}},d={args:{"aria-label":"Locked notes",defaultValue:"Read-only content.",disabled:!0}},c={render:()=>r.jsxs("div",{className:"stories-stack",children:[r.jsx(t,{size:"small","aria-label":"Small",placeholder:"Small"}),r.jsx(t,{size:"medium","aria-label":"Medium",placeholder:"Medium"}),r.jsx(t,{size:"large","aria-label":"Large",placeholder:"Large"})]})},u={args:{"aria-label":"Job description",placeholder:"Describe the role…",name:"description",rows:5},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[o=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),r.jsx(o,{}))]};var g,x,y;l.parameters={...l.parameters,docs:{...(g=l.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    'aria-label': 'Job description',
    placeholder: 'Describe the role…',
    name: 'description',
    rows: 5
  }
}`,...(y=(x=l.parameters)==null?void 0:x.docs)==null?void 0:y.source}}};var v,z,S;n.parameters={...n.parameters,docs:{...(v=n.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    'aria-label': 'Job description',
    placeholder: 'Describe the role…',
    invalid: true,
    defaultValue: 'too short'
  }
}`,...(S=(z=n.parameters)==null?void 0:z.docs)==null?void 0:S.source}}};var k,T,D;i.parameters={...i.parameters,docs:{...(k=i.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    'aria-label': 'Notes',
    placeholder: 'Type to grow…',
    autoResize: true,
    defaultValue: 'This textarea grows as you type.'
  }
}`,...(D=(T=i.parameters)==null?void 0:T.docs)==null?void 0:D.source}}};var w,_,j;d.parameters={...d.parameters,docs:{...(w=d.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    'aria-label': 'Locked notes',
    defaultValue: 'Read-only content.',
    disabled: true
  }
}`,...(j=(_=d.parameters)==null?void 0:_.docs)==null?void 0:j.source}}};var R,V,M;c.parameters={...c.parameters,docs:{...(R=c.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => <div className="stories-stack">\r
      <Textarea size="small" aria-label="Small" placeholder="Small" />\r
      <Textarea size="medium" aria-label="Medium" placeholder="Medium" />\r
      <Textarea size="large" aria-label="Large" placeholder="Large" />\r
    </div>
}`,...(M=(V=c.parameters)==null?void 0:V.docs)==null?void 0:M.source}}};var N,E,F;u.parameters={...u.parameters,docs:{...(N=u.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    'aria-label': 'Job description',
    placeholder: 'Describe the role…',
    name: 'description',
    rows: 5
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
}`,...(F=(E=u.parameters)==null?void 0:E.docs)==null?void 0:F.source}}};const B=["Default","Invalid","AutoResize","Disabled","Sizes","DarkMode"];export{i as AutoResize,u as DarkMode,l as Default,d as Disabled,n as Invalid,c as Sizes,B as __namedExportsOrder,$ as default};
