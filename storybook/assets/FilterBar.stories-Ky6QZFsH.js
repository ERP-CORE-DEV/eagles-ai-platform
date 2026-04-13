import{j as a}from"./jsx-runtime-Z5uAzocK.js";import{r as _}from"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function m({filters:e,onToggle:o,onClearAll:s,ariaLabel:p="Filtres",className:l=""}){const n=["filter-bar",l].filter(Boolean).join(" "),t=e.some(r=>r.active);return a.jsxs("div",{className:n,role:"toolbar","aria-label":p,children:[a.jsx("div",{className:"filter-bar-list",children:e.map(r=>{const N=["filter-bar-pill",r.active?"filter-bar-pill-active":""].filter(Boolean).join(" ");return a.jsx("button",{type:"button",className:N,"aria-pressed":r.active,onClick:()=>o(r.id),children:r.label},r.id)})}),s&&t&&a.jsx("button",{type:"button",className:"filter-bar-clear",onClick:s,"aria-label":"Effacer tous les filtres",children:"Effacer"})]})}try{m.displayName="FilterBar",m.__docgenInfo={description:`FilterBar — horizontal toolbar of filter pills.

Each filter is a button with aria-pressed state. Optional clear-all
button when at least one filter is active.`,displayName:"FilterBar",props:{filters:{defaultValue:null,description:"Filter list",name:"filters",required:!0,type:{name:"FilterItem[]"}},onToggle:{defaultValue:null,description:"Toggle handler — called with the filter id",name:"onToggle",required:!0,type:{name:"(id: string) => void"}},onClearAll:{defaultValue:null,description:"Optional clear-all handler — when present a clear button is rendered",name:"onClearAll",required:!1,type:{name:"(() => void)"}},ariaLabel:{defaultValue:{value:"Filtres"},description:"Accessible label for the toolbar",name:"ariaLabel",required:!1,type:{name:"string"}},className:{defaultValue:{value:""},description:"Additional CSS class names",name:"className",required:!1,type:{name:"string"}}}}}catch{}const L={title:"ERP/FilterBar",component:m,parameters:{layout:"padded",docs:{description:{component:"Horizontal filter toolbar. Each pill toggles its aria-pressed state. Optional clear-all button."}}},tags:["autodocs"]},f=[{id:"cdi",label:"CDI",active:!0},{id:"cdd",label:"CDD",active:!1},{id:"freelance",label:"Freelance",active:!0},{id:"paris",label:"Paris",active:!1},{id:"lyon",label:"Lyon",active:!1},{id:"remote",label:"Télétravail",active:!1},{id:"senior",label:"Senior",active:!1}];function E(){const[e,o]=_.useState(f),s=l=>{o(n=>n.map(t=>t.id===l?{...t,active:!t.active}:t))},p=()=>{o(l=>l.map(n=>({...n,active:!1})))};return a.jsx(m,{filters:e,onToggle:s,onClearAll:p})}const i={render:()=>a.jsx(E,{})},c={args:{filters:f.map(e=>({...e,active:!1})),onToggle:()=>{},onClearAll:()=>{}}},d={args:{filters:f.map(e=>({...e,active:!0})),onToggle:()=>{},onClearAll:()=>{}}},u={render:()=>a.jsx(E,{}),parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[e=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),a.jsx(e,{}))]};var b,g,v;i.parameters={...i.parameters,docs:{...(b=i.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <StatefulFilterBar />
}`,...(v=(g=i.parameters)==null?void 0:g.docs)==null?void 0:v.source}}};var h,A,y;c.parameters={...c.parameters,docs:{...(h=c.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    filters: INITIAL_FILTERS.map(filter => ({
      ...filter,
      active: false
    })),
    onToggle: () => undefined,
    onClearAll: () => undefined
  }
}`,...(y=(A=c.parameters)==null?void 0:A.docs)==null?void 0:y.source}}};var F,S,T;d.parameters={...d.parameters,docs:{...(F=d.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    filters: INITIAL_FILTERS.map(filter => ({
      ...filter,
      active: true
    })),
    onToggle: () => undefined,
    onClearAll: () => undefined
  }
}`,...(T=(S=d.parameters)==null?void 0:S.docs)==null?void 0:T.source}}};var I,x,C;u.parameters={...u.parameters,docs:{...(I=u.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: () => <StatefulFilterBar />,
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
}`,...(C=(x=u.parameters)==null?void 0:x.docs)==null?void 0:C.source}}};const D=["Default","NoActive","AllActive","DarkMode"];export{d as AllActive,u as DarkMode,i as Default,c as NoActive,D as __namedExportsOrder,L as default};
