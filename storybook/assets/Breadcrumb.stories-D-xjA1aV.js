import{j as e}from"./jsx-runtime-Z5uAzocK.js";import{r as E}from"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function l({items:a,separator:D="/",className:I=""}){const A=["breadcrumb",I].filter(Boolean).join(" ");return e.jsx("nav",{"aria-label":"Breadcrumb",className:A,children:e.jsx("ol",{className:"breadcrumb-list",children:a.map((r,d)=>{const m=d===a.length-1,C=`${r.label}-${d}`;return e.jsxs(E.Fragment,{children:[e.jsx("li",{className:"breadcrumb-item",children:m?e.jsx("span",{className:"breadcrumb-current","aria-current":"page",children:r.label}):r.href?e.jsx("a",{className:"breadcrumb-link",href:r.href,children:r.label}):r.onClick?e.jsx("button",{type:"button",className:"breadcrumb-link breadcrumb-link-button",onClick:r.onClick,children:r.label}):e.jsx("span",{className:"breadcrumb-text",children:r.label})}),!m&&e.jsx("li",{className:"breadcrumb-separator","aria-hidden":"true",role:"presentation",children:D})]},C)})})})}try{l.displayName="Breadcrumb",l.__docgenInfo={description:`Breadcrumb — navigation chain showing the user's location in a hierarchy.

The last item is rendered as the current page (aria-current="page", not a link).
All preceding items are links if href is provided.`,displayName:"Breadcrumb",props:{items:{defaultValue:null,description:"Ordered list of breadcrumb items. The last item is the current page.",name:"items",required:!0,type:{name:"BreadcrumbItem[]"}},separator:{defaultValue:{value:"/"},description:"Separator character between items",name:"separator",required:!1,type:{name:"string"}},className:{defaultValue:{value:""},description:"Additional CSS class names",name:"className",required:!1,type:{name:"string"}}}}}catch{}const T={title:"Navigation/Breadcrumb",component:l,parameters:{layout:"padded",docs:{description:{component:"Breadcrumb navigation showing the user position in a hierarchy. Last item is the current page."}}},tags:["autodocs"]},i=[{label:"Accueil",href:"/"},{label:"Candidats",href:"/candidates"},{label:"Jane Doe"}],s={args:{items:i}},t={args:{items:i,separator:"›"}},n={args:{items:[{label:"Tableau de bord"}]}},c={args:{items:[{label:"Accueil",href:"/"},{label:"RH",href:"/rh"},{label:"Recrutement",href:"/rh/recrutement"},{label:"Offres",href:"/rh/recrutement/offres"},{label:"Développeur Senior"}]}},o={args:{items:i},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[a=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(a,{}))]};var u,p,b;s.parameters={...s.parameters,docs:{...(u=s.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    items: baseItems
  }
}`,...(b=(p=s.parameters)==null?void 0:p.docs)==null?void 0:b.source}}};var h,f,g;t.parameters={...t.parameters,docs:{...(h=t.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    items: baseItems,
    separator: '›'
  }
}`,...(g=(f=t.parameters)==null?void 0:f.docs)==null?void 0:g.source}}};var k,y,S;n.parameters={...n.parameters,docs:{...(k=n.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    items: [{
      label: 'Tableau de bord'
    }]
  }
}`,...(S=(y=n.parameters)==null?void 0:y.docs)==null?void 0:S.source}}};var x,j,N;c.parameters={...c.parameters,docs:{...(x=c.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    items: [{
      label: 'Accueil',
      href: '/'
    }, {
      label: 'RH',
      href: '/rh'
    }, {
      label: 'Recrutement',
      href: '/rh/recrutement'
    }, {
      label: 'Offres',
      href: '/rh/recrutement/offres'
    }, {
      label: 'Développeur Senior'
    }]
  }
}`,...(N=(j=c.parameters)==null?void 0:j.docs)==null?void 0:N.source}}};var _,v,B;o.parameters={...o.parameters,docs:{...(_=o.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    items: baseItems
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
}`,...(B=(v=o.parameters)==null?void 0:v.docs)==null?void 0:B.source}}};const q=["Default","WithCustomSeparator","SingleItem","DeepHierarchy","DarkMode"];export{o as DarkMode,c as DeepHierarchy,s as Default,n as SingleItem,t as WithCustomSeparator,q as __namedExportsOrder,T as default};
