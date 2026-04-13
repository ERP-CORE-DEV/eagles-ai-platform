import{j as e}from"./jsx-runtime-Z5uAzocK.js";import{S as V}from"./Stat-Bsx87Wl3.js";import"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function a({title:t,value:b,delta:O,icon:l,footer:u,className:U=""}){const q=["metric-card",U].filter(Boolean).join(" ");return e.jsxs("div",{className:q,children:[e.jsxs("div",{className:"metric-card-header",children:[e.jsx("div",{className:"metric-card-stat",children:e.jsx(V,{label:t,value:b,trend:O})}),l&&e.jsx("span",{className:"metric-card-icon","aria-hidden":"true",children:l})]}),u&&e.jsx("div",{className:"metric-card-footer",children:u})]})}try{a.displayName="MetricCard",a.__docgenInfo={description:`MetricCard — card wrapper around a Stat with icon + footer slots.

Token-only styling, light + dark via data-theme="dark".`,displayName:"MetricCard",props:{title:{defaultValue:null,description:"Card title — passed as Stat label",name:"title",required:!0,type:{name:"string"}},value:{defaultValue:null,description:"Metric value",name:"value",required:!0,type:{name:"string | number"}},delta:{defaultValue:null,description:"Optional trend delta",name:"delta",required:!1,type:{name:"StatTrend"}},icon:{defaultValue:null,description:"Optional icon slot — rendered top-right",name:"icon",required:!1,type:{name:"ReactNode"}},footer:{defaultValue:null,description:"Optional footer — rendered below the stat",name:"footer",required:!1,type:{name:"ReactNode"}},className:{defaultValue:{value:""},description:"Additional CSS class names",name:"className",required:!1,type:{name:"string"}}}}}catch{}const B={title:"Data/MetricCard",component:a,parameters:{layout:"padded",docs:{description:{component:"MetricCard — card wrapper around a Stat with icon and footer slots."}}},tags:["autodocs"]},r=e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:[e.jsx("path",{d:"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"}),e.jsx("circle",{cx:"9",cy:"7",r:"4"}),e.jsx("path",{d:"M23 21v-2a4 4 0 0 0-3-3.87"}),e.jsx("path",{d:"M16 3.13a4 4 0 0 1 0 7.75"})]}),n={args:{title:"Candidats actifs",value:1284,delta:{direction:"up",value:"+12.5%"},icon:r,footer:"Mis à jour il y a 5 minutes"}},s={args:{title:"Offres ouvertes",value:42,delta:{direction:"up",value:"+5"}}},o={args:{title:"Délai moyen",value:"14 jours",delta:{direction:"down",value:"-3 jours"},icon:r}},i={args:{title:"Total candidats",value:9421}},d={render:()=>e.jsxs("div",{className:"stories-row",children:[e.jsx(a,{title:"Candidats",value:1284,delta:{direction:"up",value:"+12%"},icon:r}),e.jsx(a,{title:"Offres",value:42,delta:{direction:"up",value:"+5"},icon:r}),e.jsx(a,{title:"Délai",value:"14 j",delta:{direction:"down",value:"-3 j"},icon:r})]})},c={args:{title:"Candidats actifs",value:1284,delta:{direction:"up",value:"+12.5%"},icon:r,footer:"Mis à jour il y a 5 minutes"},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[t=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(t,{}))]};var m,p,v;n.parameters={...n.parameters,docs:{...(m=n.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    title: 'Candidats actifs',
    value: 1284,
    delta: {
      direction: 'up',
      value: '+12.5%'
    },
    icon: UsersIcon,
    footer: 'Mis à jour il y a 5 minutes'
  }
}`,...(v=(p=n.parameters)==null?void 0:p.docs)==null?void 0:v.source}}};var f,j,g;s.parameters={...s.parameters,docs:{...(f=s.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    title: 'Offres ouvertes',
    value: 42,
    delta: {
      direction: 'up',
      value: '+5'
    }
  }
}`,...(g=(j=s.parameters)==null?void 0:j.docs)==null?void 0:g.source}}};var h,y,x;o.parameters={...o.parameters,docs:{...(h=o.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    title: 'Délai moyen',
    value: '14 jours',
    delta: {
      direction: 'down',
      value: '-3 jours'
    },
    icon: UsersIcon
  }
}`,...(x=(y=o.parameters)==null?void 0:y.docs)==null?void 0:x.source}}};var M,C,N;i.parameters={...i.parameters,docs:{...(M=i.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    title: 'Total candidats',
    value: 9421
  }
}`,...(N=(C=i.parameters)==null?void 0:C.docs)==null?void 0:N.source}}};var S,k,w;d.parameters={...d.parameters,docs:{...(S=d.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <div className="stories-row">\r
      <MetricCard title="Candidats" value={1284} delta={{
      direction: 'up',
      value: '+12%'
    }} icon={UsersIcon} />\r
      <MetricCard title="Offres" value={42} delta={{
      direction: 'up',
      value: '+5'
    }} icon={UsersIcon} />\r
      <MetricCard title="Délai" value="14 j" delta={{
      direction: 'down',
      value: '-3 j'
    }} icon={UsersIcon} />\r
    </div>
}`,...(w=(k=d.parameters)==null?void 0:k.docs)==null?void 0:w.source}}};var I,_,D;c.parameters={...c.parameters,docs:{...(I=c.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    title: 'Candidats actifs',
    value: 1284,
    delta: {
      direction: 'up',
      value: '+12.5%'
    },
    icon: UsersIcon,
    footer: 'Mis à jour il y a 5 minutes'
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
}`,...(D=(_=c.parameters)==null?void 0:_.docs)==null?void 0:D.source}}};const F=["Default","NoIcon","NoFooter","Minimal","Grid","DarkMode"];export{c as DarkMode,n as Default,d as Grid,i as Minimal,o as NoFooter,s as NoIcon,F as __namedExportsOrder,B as default};
