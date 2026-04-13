import{j as e}from"./jsx-runtime-Z5uAzocK.js";import{r as n}from"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function m({value:a,defaultValue:l="",onSearch:o,onChange:r,placeholder:c="Rechercher…",debounceMs:b=300,disabled:f=!1,ariaLabel:M}){const L=n.useId(),s=a!==void 0,[B,g]=n.useState(l),d=s?a??"":B,y=n.useRef(null);n.useEffect(()=>{if(!o)return;const t=setTimeout(()=>{o(d)},b);return()=>{clearTimeout(t)}},[d,b,o]);const I=n.useCallback(t=>{const v=t.target.value;s||g(v),r&&r(v)},[s,r]),T=n.useCallback(()=>{var t;s||g(""),r&&r(""),(t=y.current)==null||t.focus()},[s,r]),W=d.length>0&&!f;return e.jsxs("div",{className:`search-bar${f?" search-bar-disabled":""}`,children:[e.jsx("span",{className:"search-bar-icon","aria-hidden":"true",children:e.jsxs("svg",{className:"search-bar-icon-svg",viewBox:"0 0 24 24",focusable:"false","aria-hidden":"true",children:[e.jsx("circle",{cx:"11",cy:"11",r:"7",fill:"none",stroke:"currentColor",strokeWidth:"2"}),e.jsx("path",{d:"M20 20 L16 16",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",fill:"none"})]})}),e.jsx("input",{ref:y,id:L,type:"search",className:"search-bar-input",value:d,onChange:I,placeholder:c,disabled:f,"aria-label":M??c,autoComplete:"off"}),W&&e.jsx("button",{type:"button",className:"search-bar-clear","aria-label":"Effacer la recherche",onClick:T,children:e.jsx("svg",{className:"search-bar-clear-icon",viewBox:"0 0 24 24",focusable:"false","aria-hidden":"true",children:e.jsx("path",{d:"M6 6 L18 18 M18 6 L6 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",fill:"none"})})})]})}try{m.displayName="SearchBar",m.__docgenInfo={description:"SearchBar — debounced search input with leading icon and clear button.\n\nSupports both controlled (`value`) and uncontrolled (`defaultValue`) modes.\n`onSearch` is debounced via setTimeout inside useEffect; `onChange` fires\nsynchronously on every keystroke. The clear button only appears when the\nvalue is non-empty. Token-only styling, light + dark.",displayName:"SearchBar",props:{value:{defaultValue:null,description:"Controlled value — if provided, the component is controlled",name:"value",required:!1,type:{name:"string"}},defaultValue:{defaultValue:{value:""},description:"Initial value for the uncontrolled mode",name:"defaultValue",required:!1,type:{name:"string"}},onSearch:{defaultValue:null,description:"Called after the debounce window with the latest query",name:"onSearch",required:!1,type:{name:"((query: string) => void)"}},onChange:{defaultValue:null,description:"Called synchronously on every keystroke (no debounce)",name:"onChange",required:!1,type:{name:"((query: string) => void)"}},placeholder:{defaultValue:{value:"Rechercher…"},description:'Placeholder text — defaults to French "Rechercher…"',name:"placeholder",required:!1,type:{name:"string"}},debounceMs:{defaultValue:{value:"300"},description:"Debounce window in milliseconds — defaults to 300",name:"debounceMs",required:!1,type:{name:"number"}},disabled:{defaultValue:{value:"false"},description:"Disables the input and clear button",name:"disabled",required:!1,type:{name:"boolean"}},ariaLabel:{defaultValue:null,description:"Accessible label for the input — defaults to the placeholder",name:"ariaLabel",required:!1,type:{name:"string"}}}}}catch{}const O={title:"ERP/SearchBar",component:m,parameters:{layout:"padded",docs:{description:{component:"Debounced search input with leading icon and optional clear button. Supports controlled and uncontrolled modes."}}},tags:["autodocs"]};function E({placeholder:a}){const[l,o]=n.useState(""),[r,c]=n.useState("");return e.jsxs("div",{className:"search-bar-demo",children:[e.jsx(m,{value:l,onChange:o,onSearch:c,placeholder:a,debounceMs:300}),e.jsxs("p",{className:"search-bar-demo-debug",children:["Valeur en cours : ",e.jsx("strong",{children:l||"(vide)"})]}),e.jsxs("p",{className:"search-bar-demo-debug",children:["Dernière recherche (debounced) : ",e.jsx("strong",{children:r||"(aucune)"})]})]})}const u={render:()=>e.jsx(E,{placeholder:"Rechercher un candidat (nom, compétence, ville)…"})},i={args:{defaultValue:"Marie Dupont",placeholder:"Rechercher un candidat…",onSearch:a=>{console.log("search:",a)}}},h={args:{placeholder:"Rechercher un candidat…",disabled:!0}},p={render:()=>e.jsx(E,{placeholder:"Rechercher un candidat (nom, compétence, ville)…"}),parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[a=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(a,{}))]};var x,k,S;u.parameters={...u.parameters,docs:{...(x=u.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <ControlledDemo placeholder="Rechercher un candidat (nom, compétence, ville)…" />
}`,...(S=(k=u.parameters)==null?void 0:k.docs)==null?void 0:S.source}}};var j,V,C;i.parameters={...i.parameters,docs:{...(j=i.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    defaultValue: 'Marie Dupont',
    placeholder: 'Rechercher un candidat…',
    onSearch: q => {
      // eslint-disable-next-line no-console
      console.log('search:', q);
    }
  }
}`,...(C=(V=i.parameters)==null?void 0:V.docs)==null?void 0:C.source}}};var D,R,q;h.parameters={...h.parameters,docs:{...(D=h.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    placeholder: 'Rechercher un candidat…',
    disabled: true
  }
}`,...(q=(R=h.parameters)==null?void 0:R.docs)==null?void 0:q.source}}};var w,N,_;p.parameters={...p.parameters,docs:{...(w=p.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => <ControlledDemo placeholder="Rechercher un candidat (nom, compétence, ville)…" />,
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
}`,...(_=(N=p.parameters)==null?void 0:N.docs)==null?void 0:_.source}}};const $=["Default","WithDefaultValue","Disabled","DarkMode"];export{p as DarkMode,u as Default,h as Disabled,i as WithDefaultValue,$ as __namedExportsOrder,O as default};
