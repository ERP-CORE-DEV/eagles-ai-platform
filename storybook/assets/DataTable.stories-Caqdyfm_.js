import{j as a}from"./jsx-runtime-Z5uAzocK.js";import{fn as q}from"./index-DgAF9SIF.js";import"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function U(e,d){const n=e[d];return n==null?"":typeof n=="string"||typeof n=="number"||typeof n=="boolean"?String(n):null}function f({columns:e,rows:d,rowKey:n,empty:E,onRowClick:o,className:L=""}){const g=["data-table",L].filter(Boolean).join(" "),s=!!o;return d.length===0?a.jsxs("div",{className:g,children:[a.jsx("table",{className:"data-table-table",children:a.jsx("thead",{className:"data-table-thead",children:a.jsx("tr",{children:e.map(r=>a.jsx("th",{scope:"col",className:`data-table-th data-table-align-${r.align??"left"}`,children:r.header},r.key))})})}),a.jsx("div",{className:"data-table-empty",role:"status",children:E??"Aucune donnée"})]}):a.jsx("div",{className:g,children:a.jsxs("table",{className:"data-table-table",children:[a.jsx("thead",{className:"data-table-thead",children:a.jsx("tr",{children:e.map(r=>a.jsx("th",{scope:"col",className:`data-table-th data-table-align-${r.align??"left"}`,children:r.header},r.key))})}),a.jsx("tbody",{children:d.map(r=>{const A=n(r),T=["data-table-tr",s?"data-table-tr-clickable":""].filter(Boolean).join(" "),R=()=>{o&&o(r)},P=t=>{o&&(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),o(r))};return a.jsx("tr",{className:T,onClick:s?R:void 0,onKeyDown:s?P:void 0,tabIndex:s?0:void 0,role:s?"button":void 0,children:e.map(t=>a.jsx("td",{className:`data-table-td data-table-align-${t.align??"left"}`,children:t.render?t.render(r):U(r,t.key)},t.key))},A)})})]})})}try{f.displayName="DataTable",f.__docgenInfo={description:`DataTable — typed generic table with semantic <table> markup.

Token-only styling, light + dark via data-theme="dark".`,displayName:"DataTable",props:{columns:{defaultValue:null,description:"Column definitions",name:"columns",required:!0,type:{name:"DataTableColumn<T>[]"}},rows:{defaultValue:null,description:"Row data",name:"rows",required:!0,type:{name:"T[]"}},rowKey:{defaultValue:null,description:"Stable key extractor for each row",name:"rowKey",required:!0,type:{name:"(row: T) => string"}},empty:{defaultValue:null,description:"Empty-state content (rendered when rows is empty)",name:"empty",required:!1,type:{name:"ReactNode"}},onRowClick:{defaultValue:null,description:"Optional row click handler — wraps row in interactive semantics",name:"onRowClick",required:!1,type:{name:"((row: T) => void)"}},className:{defaultValue:{value:""},description:"Additional CSS class names",name:"className",required:!1,type:{name:"string"}}}}}catch{}const y=[{id:"c1",name:"Alice Martin",role:"Developer",contract:"CDI",salary:52e3},{id:"c2",name:"Bob Dupont",role:"Designer",contract:"CDD",salary:48e3},{id:"c3",name:"Claire Leroy",role:"Product Manager",contract:"CDI",salary:65e3},{id:"c4",name:"David Bernard",role:"DevOps",contract:"Freelance",salary:75e3}],l=[{key:"name",header:"Nom",align:"left"},{key:"role",header:"Poste",align:"left"},{key:"contract",header:"Contrat",align:"center"},{key:"salary",header:"Salaire",align:"right",render:e=>`${e.salary.toLocaleString("fr-FR")} €`}],$={title:"Data/DataTable",component:f,parameters:{layout:"padded",docs:{description:{component:"DataTable — typed generic table with semantic <table> markup."}}},tags:["autodocs"]},c={args:{columns:l,rows:y,rowKey:e=>e.id}},i={args:{columns:l,rows:y,rowKey:e=>e.id,onRowClick:q()}},m={args:{columns:l,rows:[],rowKey:e=>e.id,empty:"Aucun candidat trouvé"}},u={args:{columns:l,rows:[y[0]],rowKey:e=>e.id}},p={args:{columns:l,rows:y,rowKey:e=>e.id},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[e=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),a.jsx(e,{}))]};var w,b,h;c.parameters={...c.parameters,docs:{...(w=c.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    columns: COLUMNS,
    rows: SAMPLE_ROWS,
    rowKey: (row: Candidate) => row.id
  }
}`,...(h=(b=c.parameters)==null?void 0:b.docs)==null?void 0:h.source}}};var k,S,C;i.parameters={...i.parameters,docs:{...(k=i.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    columns: COLUMNS,
    rows: SAMPLE_ROWS,
    rowKey: (row: Candidate) => row.id,
    onRowClick: fn()
  }
}`,...(C=(S=i.parameters)==null?void 0:S.docs)==null?void 0:C.source}}};var D,N,x;m.parameters={...m.parameters,docs:{...(D=m.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    columns: COLUMNS,
    rows: [],
    rowKey: (row: Candidate) => row.id,
    empty: 'Aucun candidat trouvé'
  }
}`,...(x=(N=m.parameters)==null?void 0:N.docs)==null?void 0:x.source}}};var j,v,M;u.parameters={...u.parameters,docs:{...(j=u.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    columns: COLUMNS,
    rows: [SAMPLE_ROWS[0]],
    rowKey: (row: Candidate) => row.id
  }
}`,...(M=(v=u.parameters)==null?void 0:v.docs)==null?void 0:M.source}}};var _,K,O;p.parameters={...p.parameters,docs:{...(_=p.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    columns: COLUMNS,
    rows: SAMPLE_ROWS,
    rowKey: (row: Candidate) => row.id
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
}`,...(O=(K=p.parameters)==null?void 0:K.docs)==null?void 0:O.source}}};const F=["Default","Clickable","Empty","SingleRow","DarkMode"];export{i as Clickable,p as DarkMode,c as Default,m as Empty,u as SingleRow,F as __namedExportsOrder,$ as default};
