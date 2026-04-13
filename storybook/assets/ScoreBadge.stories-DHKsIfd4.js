import{j as e}from"./jsx-runtime-Z5uAzocK.js";import{S as a}from"./ScoreBadge-BktA-Ma3.js";import"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";const j={title:"ERP/ScoreBadge",component:a,parameters:{layout:"padded",docs:{description:{component:"Circular score meter for matching results. Color shifts across error / warning / info / success thresholds."}}},tags:["autodocs"],argTypes:{size:{control:"select",options:["small","medium","large"]},value:{control:{type:"range",min:0,max:100,step:1}}}},r={args:{value:87,label:"Match",size:"medium"}},s={render:()=>e.jsxs("div",{className:"stories-row",children:[e.jsx(a,{value:32,label:"Faible"}),e.jsx(a,{value:61,label:"Moyen"}),e.jsx(a,{value:82,label:"Bon"}),e.jsx(a,{value:95,label:"Excellent"})]})},o={render:()=>e.jsxs("div",{className:"stories-row",children:[e.jsx(a,{value:87,label:"Match",size:"small"}),e.jsx(a,{value:87,label:"Match",size:"medium"}),e.jsx(a,{value:87,label:"Match",size:"large"})]})},t={args:{value:87,label:"Match",size:"medium"},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[S=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(S,{}))]};var l,n,c;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    value: 87,
    label: 'Match',
    size: 'medium'
  }
}`,...(c=(n=r.parameters)==null?void 0:n.docs)==null?void 0:c.source}}};var d,m,i;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <div className="stories-row">\r
      <ScoreBadge value={32} label="Faible" />\r
      <ScoreBadge value={61} label="Moyen" />\r
      <ScoreBadge value={82} label="Bon" />\r
      <ScoreBadge value={95} label="Excellent" />\r
    </div>
}`,...(i=(m=s.parameters)==null?void 0:m.docs)==null?void 0:i.source}}};var u,p,g;o.parameters={...o.parameters,docs:{...(u=o.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => <div className="stories-row">\r
      <ScoreBadge value={87} label="Match" size="small" />\r
      <ScoreBadge value={87} label="Match" size="medium" />\r
      <ScoreBadge value={87} label="Match" size="large" />\r
    </div>
}`,...(g=(p=o.parameters)==null?void 0:p.docs)==null?void 0:g.source}}};var v,b,h;t.parameters={...t.parameters,docs:{...(v=t.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    value: 87,
    label: 'Match',
    size: 'medium'
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
}`,...(h=(b=t.parameters)==null?void 0:b.docs)==null?void 0:h.source}}};const B=["Default","Thresholds","Sizes","DarkMode"];export{t as DarkMode,r as Default,o as Sizes,s as Thresholds,B as __namedExportsOrder,j as default};
