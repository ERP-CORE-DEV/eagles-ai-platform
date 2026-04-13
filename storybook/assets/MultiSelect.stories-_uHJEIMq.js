import{j as e}from"./jsx-runtime-Z5uAzocK.js";import{r}from"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function o({options:a,value:l,onChange:f,label:R,placeholder:E="Select…",invalid:x=!1}){var y;const[c,b]=r.useState(!1),g=r.useRef(null),S=r.useId(),v=`${S}-label`,k=`${S}-listbox`;r.useEffect(()=>{if(!c)return;const t=n=>{g.current&&(g.current.contains(n.target)||b(!1))},s=n=>{n.key==="Escape"&&b(!1)};return document.addEventListener("mousedown",t),document.addEventListener("keydown",s),()=>{document.removeEventListener("mousedown",t),document.removeEventListener("keydown",s)}},[c]);const T=t=>{l.includes(t)?f(l.filter(s=>s!==t)):f([...l,t])},i=l.length,$=i===0?E:i===1?((y=a.find(t=>t.value===l[0]))==null?void 0:y.label)??`${i} selected`:`${i} selected`,K=["multi-select-trigger",x?"multi-select-trigger-invalid":"",i===0?"multi-select-trigger-placeholder":""].filter(Boolean).join(" ");return e.jsxs("div",{className:"multi-select",ref:g,children:[e.jsx("span",{id:v,className:"multi-select-label",children:R}),e.jsxs("button",{type:"button",className:K,"aria-haspopup":"listbox","aria-expanded":c,"aria-controls":k,"aria-labelledby":v,"aria-invalid":x?"true":void 0,onClick:()=>b(t=>!t),children:[e.jsx("span",{className:"multi-select-trigger-text",children:$}),e.jsx("span",{className:"multi-select-trigger-chevron","aria-hidden":"true",children:e.jsx("svg",{viewBox:"0 0 20 20",width:"16",height:"16",fill:"none",children:e.jsx("path",{d:"M5 8l5 5 5-5",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})})})]}),c&&e.jsx("ul",{id:k,className:"multi-select-panel",role:"listbox","aria-multiselectable":"true","aria-labelledby":v,children:a.map(t=>{const s=l.includes(t.value),n=`${k}-${t.value}`;return e.jsx("li",{id:n,role:"option","aria-selected":s,className:"multi-select-option",children:e.jsxs("label",{className:"multi-select-option-label",htmlFor:`${n}-cb`,children:[e.jsx("input",{id:`${n}-cb`,type:"checkbox",className:"multi-select-option-checkbox",checked:s,onChange:()=>T(t.value)}),e.jsx("span",{className:"multi-select-option-text",children:t.label})]})},t.value)})})]})}try{o.displayName="MultiSelect",o.__docgenInfo={description:`MultiSelect — checkbox list presented as a dropdown.

Trigger button uses aria-haspopup="listbox" + aria-expanded.
Panel uses role="listbox" with role="option" items and aria-selected.`,displayName:"MultiSelect",props:{options:{defaultValue:null,description:"Available options",name:"options",required:!0,type:{name:"MultiSelectOption[]"}},value:{defaultValue:null,description:"Currently selected values (controlled)",name:"value",required:!0,type:{name:"string[]"}},onChange:{defaultValue:null,description:"Change handler — receives the next array of selected values",name:"onChange",required:!0,type:{name:"(next: string[]) => void"}},label:{defaultValue:null,description:"Visible label rendered above the trigger",name:"label",required:!0,type:{name:"string"}},placeholder:{defaultValue:{value:"Select…"},description:"Placeholder shown when no options are selected",name:"placeholder",required:!1,type:{name:"string"}},invalid:{defaultValue:{value:"false"},description:"Marks the field as invalid",name:"invalid",required:!1,type:{name:"boolean"}}}}}catch{}const F={title:"Forms/MultiSelect",component:o,parameters:{layout:"padded",docs:{description:{component:'Checkbox list dropdown. Trigger uses aria-haspopup="listbox", panel uses role="listbox" with role="option" items.'}}},tags:["autodocs"]},h=[{value:"react",label:"React"},{value:"typescript",label:"TypeScript"},{value:"node",label:"Node.js"},{value:"graphql",label:"GraphQL"},{value:"docker",label:"Docker"},{value:"kubernetes",label:"Kubernetes"}],u={render:()=>{const[a,l]=r.useState([]);return e.jsx(o,{label:"Required skills",placeholder:"Pick skills…",options:h,value:a,onChange:l})}},d={render:()=>{const[a,l]=r.useState(["react","typescript"]);return e.jsx(o,{label:"Required skills",placeholder:"Pick skills…",options:h,value:a,onChange:l})}},p={render:()=>{const[a,l]=r.useState([]);return e.jsx(o,{label:"Required skills",placeholder:"At least one required",options:h,value:a,onChange:l,invalid:!0})}},m={render:()=>{const[a,l]=r.useState(["react"]);return e.jsx(o,{label:"Required skills",placeholder:"Pick skills…",options:h,value:a,onChange:l})},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[a=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(a,{}))]};var j,C,I;u.parameters={...u.parameters,docs:{...(j=u.parameters)==null?void 0:j.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return <MultiSelect label="Required skills" placeholder="Pick skills…" options={SKILL_OPTIONS} value={value} onChange={setValue} />;
  }
}`,...(I=(C=u.parameters)==null?void 0:C.docs)==null?void 0:I.source}}};var L,N,q;d.parameters={...d.parameters,docs:{...(L=d.parameters)==null?void 0:L.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string[]>(['react', 'typescript']);
    return <MultiSelect label="Required skills" placeholder="Pick skills…" options={SKILL_OPTIONS} value={value} onChange={setValue} />;
  }
}`,...(q=(N=d.parameters)==null?void 0:N.docs)==null?void 0:q.source}}};var V,O,P;p.parameters={...p.parameters,docs:{...(V=p.parameters)==null?void 0:V.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return <MultiSelect label="Required skills" placeholder="At least one required" options={SKILL_OPTIONS} value={value} onChange={setValue} invalid />;
  }
}`,...(P=(O=p.parameters)==null?void 0:O.docs)==null?void 0:P.source}}};var _,M,w;m.parameters={...m.parameters,docs:{...(_=m.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<string[]>(['react']);
    return <MultiSelect label="Required skills" placeholder="Pick skills…" options={SKILL_OPTIONS} value={value} onChange={setValue} />;
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
}`,...(w=(M=m.parameters)==null?void 0:M.docs)==null?void 0:w.source}}};const G=["Default","Preselected","Invalid","DarkMode"];export{m as DarkMode,u as Default,p as Invalid,d as Preselected,G as __namedExportsOrder,F as default};
