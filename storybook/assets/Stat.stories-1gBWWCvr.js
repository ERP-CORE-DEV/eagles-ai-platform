import{j as e}from"./jsx-runtime-Z5uAzocK.js";import{S as l}from"./Stat-Bsx87Wl3.js";import"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";const M={title:"Data/Stat",component:l,parameters:{layout:"padded",docs:{description:{component:"Stat — big number + label with optional trend delta. Token-only."}}},tags:["autodocs"]},r={args:{label:"Candidats actifs",value:1284,trend:{direction:"up",value:"+12.5%"},hint:"vs. mois précédent"}},a={args:{label:"Délai moyen",value:"14 jours",trend:{direction:"down",value:"-3 jours"},hint:"vs. trimestre précédent"}},n={args:{label:"Taux de conversion",value:"23%",trend:{direction:"flat",value:"0%"}}},t={args:{label:"Total CDI",value:421}},s={args:{label:"Salaire moyen",value:"52 400 €",trend:{direction:"up",value:"+4.2%"}}},o={render:()=>e.jsxs("div",{className:"stories-row",children:[e.jsx(l,{label:"Candidats",value:1284,trend:{direction:"up",value:"+12%"}}),e.jsx(l,{label:"Offres",value:42,trend:{direction:"up",value:"+5"}}),e.jsx(l,{label:"Délai",value:"14 j",trend:{direction:"down",value:"-3 j"}})]})},d={args:{label:"Candidats actifs",value:1284,trend:{direction:"up",value:"+12.5%"},hint:"vs. mois précédent"},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[O=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(O,{}))]};var i,c,u;r.parameters={...r.parameters,docs:{...(i=r.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    label: 'Candidats actifs',
    value: 1284,
    trend: {
      direction: 'up',
      value: '+12.5%'
    },
    hint: 'vs. mois précédent'
  }
}`,...(u=(c=r.parameters)==null?void 0:c.docs)==null?void 0:u.source}}};var m,p,v;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    label: 'Délai moyen',
    value: '14 jours',
    trend: {
      direction: 'down',
      value: '-3 jours'
    },
    hint: 'vs. trimestre précédent'
  }
}`,...(v=(p=a.parameters)==null?void 0:p.docs)==null?void 0:v.source}}};var b,g,f;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    label: 'Taux de conversion',
    value: '23%',
    trend: {
      direction: 'flat',
      value: '0%'
    }
  }
}`,...(f=(g=n.parameters)==null?void 0:g.docs)==null?void 0:f.source}}};var S,j,D;t.parameters={...t.parameters,docs:{...(S=t.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    label: 'Total CDI',
    value: 421
  }
}`,...(D=(j=t.parameters)==null?void 0:j.docs)==null?void 0:D.source}}};var h,k,x;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    label: 'Salaire moyen',
    value: '52 400 €',
    trend: {
      direction: 'up',
      value: '+4.2%'
    }
  }
}`,...(x=(k=s.parameters)==null?void 0:k.docs)==null?void 0:x.source}}};var T,y,w;o.parameters={...o.parameters,docs:{...(T=o.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: () => <div className="stories-row">\r
      <Stat label="Candidats" value={1284} trend={{
      direction: 'up',
      value: '+12%'
    }} />\r
      <Stat label="Offres" value={42} trend={{
      direction: 'up',
      value: '+5'
    }} />\r
      <Stat label="Délai" value="14 j" trend={{
      direction: 'down',
      value: '-3 j'
    }} />\r
    </div>
}`,...(w=(y=o.parameters)==null?void 0:y.docs)==null?void 0:w.source}}};var C,E,N;d.parameters={...d.parameters,docs:{...(C=d.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    label: 'Candidats actifs',
    value: 1284,
    trend: {
      direction: 'up',
      value: '+12.5%'
    },
    hint: 'vs. mois précédent'
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
}`,...(N=(E=d.parameters)==null?void 0:E.docs)==null?void 0:N.source}}};const V=["Default","TrendDown","TrendFlat","NoTrend","StringValue","Grid","DarkMode"];export{d as DarkMode,r as Default,o as Grid,t as NoTrend,s as StringValue,a as TrendDown,n as TrendFlat,V as __namedExportsOrder,M as default};
