import{j as e}from"./jsx-runtime-Z5uAzocK.js";import{B as c}from"./Button-BDYnqn9u.js";import"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function i({icon:t,title:I,description:d,action:l,className:b=""}){const _=["empty-state",b].filter(Boolean).join(" ");return e.jsxs("div",{className:_,role:"status",children:[t&&e.jsx("div",{className:"empty-state-icon","aria-hidden":"true",children:t}),e.jsx("h3",{className:"empty-state-title",children:I}),d&&e.jsx("p",{className:"empty-state-description",children:d}),l&&e.jsx("div",{className:"empty-state-action",children:l})]})}try{i.displayName="EmptyState",i.__docgenInfo={description:`EmptyState — zero-state placeholder with icon, title, description, and action.

Token-only styling, light + dark via data-theme="dark". Centered layout for
use inside cards, panels, or full-page empty regions.`,displayName:"EmptyState",props:{icon:{defaultValue:null,description:"Optional icon or illustration rendered above the title",name:"icon",required:!1,type:{name:"ReactNode"}},title:{defaultValue:null,description:"Title — required, conveys the empty condition",name:"title",required:!0,type:{name:"string"}},description:{defaultValue:null,description:"Optional secondary text explaining the state",name:"description",required:!1,type:{name:"string"}},action:{defaultValue:null,description:"Optional action node — typically a Button",name:"action",required:!1,type:{name:"ReactNode"}},className:{defaultValue:{value:""},description:"Additional CSS class names",name:"className",required:!1,type:{name:"string"}}}}}catch{}const E=()=>e.jsx("svg",{viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",focusable:"false",children:e.jsx("path",{d:"M3 12h4l2 3h6l2-3h4M5 5h14l2 7v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6l2-7z",stroke:"currentColor",strokeWidth:"1.75",strokeLinecap:"round",strokeLinejoin:"round"})}),z=()=>e.jsxs("svg",{viewBox:"0 0 24 24",fill:"none","aria-hidden":"true",focusable:"false",children:[e.jsx("circle",{cx:"11",cy:"11",r:"7",stroke:"currentColor",strokeWidth:"1.75"}),e.jsx("path",{d:"m20 20-3.5-3.5",stroke:"currentColor",strokeWidth:"1.75",strokeLinecap:"round"})]}),C={title:"Data/EmptyState",component:i,parameters:{layout:"padded",docs:{description:{component:"EmptyState — zero-state placeholder with optional icon, title, description, and action. Token-only."}}},tags:["autodocs"]},a={args:{icon:e.jsx(E,{}),title:"Aucun candidat",description:"Vous n’avez pas encore de candidats dans cette offre.",action:e.jsx(c,{variant:"primary",children:"Ajouter un candidat"})}},r={args:{icon:e.jsx(z,{}),title:"Aucun résultat",description:"Essayez d’ajuster vos filtres ou votre recherche."}},n={args:{title:"Rien à afficher"}},o={args:{title:"Boîte vide",description:"Aucune notification pour le moment.",action:e.jsx(c,{variant:"secondary",children:"Actualiser"})}},s={args:{icon:e.jsx(E,{}),title:"Aucun candidat",description:"Vous n’avez pas encore de candidats dans cette offre.",action:e.jsx(c,{variant:"primary",children:"Ajouter un candidat"})},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[t=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(t,{}))]};var u,p,m;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    icon: <InboxIcon />,
    title: 'Aucun candidat',
    description: 'Vous n\\u2019avez pas encore de candidats dans cette offre.',
    action: <Button variant="primary">Ajouter un candidat</Button>
  }
}`,...(m=(p=a.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};var f,y,h;r.parameters={...r.parameters,docs:{...(f=r.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    icon: <SearchIcon />,
    title: 'Aucun résultat',
    description: 'Essayez d\\u2019ajuster vos filtres ou votre recherche.'
  }
}`,...(h=(y=r.parameters)==null?void 0:y.docs)==null?void 0:h.source}}};var g,v,x;n.parameters={...n.parameters,docs:{...(g=n.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    title: 'Rien à afficher'
  }
}`,...(x=(v=n.parameters)==null?void 0:v.docs)==null?void 0:x.source}}};var j,k,A;o.parameters={...o.parameters,docs:{...(j=o.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    title: 'Boîte vide',
    description: 'Aucune notification pour le moment.',
    action: <Button variant="secondary">Actualiser</Button>
  }
}`,...(A=(k=o.parameters)==null?void 0:k.docs)==null?void 0:A.source}}};var S,N,B;s.parameters={...s.parameters,docs:{...(S=s.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    icon: <InboxIcon />,
    title: 'Aucun candidat',
    description: 'Vous n\\u2019avez pas encore de candidats dans cette offre.',
    action: <Button variant="primary">Ajouter un candidat</Button>
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
}`,...(B=(N=s.parameters)==null?void 0:N.docs)==null?void 0:B.source}}};const D=["Default","NoResults","TitleOnly","NoIcon","DarkMode"];export{s as DarkMode,a as Default,o as NoIcon,r as NoResults,n as TitleOnly,D as __namedExportsOrder,C as default};
