import{j as e}from"./jsx-runtime-Z5uAzocK.js";import"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function d({columns:r,onCardMove:E,className:C=""}){const k=["kanban-board",C].filter(Boolean).join(" ");return e.jsx("div",{className:k,role:"group","aria-label":"Tableau Kanban",children:r.map(a=>e.jsxs("section",{className:"kanban-board-column","aria-label":`Colonne ${a.title}`,children:[e.jsxs("header",{className:"kanban-board-column-header",children:[e.jsx("h3",{className:"kanban-board-column-title",children:a.title}),e.jsx("span",{className:"kanban-board-column-count","aria-label":`${a.cards.length} cartes`,children:a.cards.length})]}),e.jsxs("ul",{className:"kanban-board-column-list",children:[a.cards.map(n=>e.jsx("li",{className:"kanban-board-card-item",children:e.jsxs("article",{className:"kanban-board-card","aria-label":n.title,children:[e.jsx("h4",{className:"kanban-board-card-title",children:n.title}),n.subtitle&&e.jsx("p",{className:"kanban-board-card-subtitle",children:n.subtitle}),n.tag&&e.jsx("span",{className:"kanban-board-card-tag",children:n.tag})]})},n.id)),a.cards.length===0&&e.jsx("li",{className:"kanban-board-empty",children:"Aucune carte"})]})]},a.id))})}try{d.displayName="KanbanBoard",d.__docgenInfo={description:`KanbanBoard — column-based task board.

Renders a horizontal scroll of columns; each column is a section with
an aria-label and contains article cards. onCardMove is exposed for
future drag-drop wiring but is intentionally a no-op stub here.`,displayName:"KanbanBoard",props:{columns:{defaultValue:null,description:"Columns to render",name:"columns",required:!0,type:{name:"KanbanColumn[]"}},onCardMove:{defaultValue:null,description:"Optional move handler — fired when a card is moved (no drag-drop wired in this baseline)",name:"onCardMove",required:!1,type:{name:"((cardId: string, toColumn: string) => void)"}},className:{defaultValue:{value:""},description:"Additional CSS class names",name:"className",required:!1,type:{name:"string"}}}}}catch{}const x={title:"ERP/KanbanBoard",component:d,parameters:{layout:"fullscreen",docs:{description:{component:"Column-based task board for recruitment pipelines. Section-per-column, article-per-card. Drag-drop is not wired in this baseline."}}},tags:["autodocs"]},i=[{id:"sourced",title:"À contacter",cards:[{id:"c-1",title:"Amélie Dubois",subtitle:"Développeuse Full-Stack — 8 ans",tag:"CDI"},{id:"c-2",title:"Mathieu Lefèvre",subtitle:"Consultant DevOps — 12 ans",tag:"Freelance"},{id:"c-3",title:"Inès Petit",subtitle:"Designer UX — 5 ans",tag:"Portage"}]},{id:"screening",title:"Pré-qualification",cards:[{id:"c-4",title:"Léa Martin",subtitle:"Data Scientist — 6 ans",tag:"CDI"},{id:"c-5",title:"Hugo Bernard",subtitle:"Ingénieur QA — 3 ans",tag:"Interim"}]},{id:"interview",title:"Entretien",cards:[{id:"c-6",title:"Sophie Marchand",subtitle:"Chargée de recrutement — 4 ans",tag:"CDD"}]},{id:"offer",title:"Offre envoyée",cards:[{id:"c-7",title:"Julien Roux",subtitle:"Architecte Cloud — 10 ans",tag:"CDI"}]},{id:"hired",title:"Embauché",cards:[]}],t={args:{columns:i,onCardMove:()=>{}}},s={args:{columns:i.map(r=>({...r,cards:[]})),onCardMove:()=>{}}},o={args:{columns:i,onCardMove:()=>{}},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[r=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(r,{}))]};var l,c,u;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    columns: RECRUITMENT_PIPELINE,
    onCardMove: () => undefined
  }
}`,...(u=(c=t.parameters)==null?void 0:c.docs)==null?void 0:u.source}}};var m,p,b;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    columns: RECRUITMENT_PIPELINE.map(column => ({
      ...column,
      cards: []
    })),
    onCardMove: () => undefined
  }
}`,...(b=(p=s.parameters)==null?void 0:p.docs)==null?void 0:b.source}}};var g,h,f;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    columns: RECRUITMENT_PIPELINE,
    onCardMove: () => undefined
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
}`,...(f=(h=o.parameters)==null?void 0:h.docs)==null?void 0:f.source}}};const M=["Default","EmptyBoard","DarkMode"];export{o as DarkMode,t as Default,s as EmptyBoard,M as __namedExportsOrder,x as default};
