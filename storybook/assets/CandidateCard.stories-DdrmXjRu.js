import{j as e}from"./jsx-runtime-Z5uAzocK.js";import{B as M}from"./Button-BDYnqn9u.js";import{S as _}from"./ScoreBadge-BktA-Ma3.js";import"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";const B={CDI:"candidate-card-contract-cdi",CDD:"candidate-card-contract-cdd",CDIC:"candidate-card-contract-cdic",Freelance:"candidate-card-contract-freelance",Interim:"candidate-card-contract-interim",Portage:"candidate-card-contract-portage",Auto:"candidate-card-contract-auto"};function n({name:a,role:A,experience:V,contractType:s,location:d,avatarInitials:F,score:l,onView:m,className:k=""}){const b=["candidate-card",k].filter(Boolean).join(" "),w=["candidate-card-contract",B[s]].join(" "),P=F??a.split(" ").map(q=>q.charAt(0)).filter(Boolean).slice(0,2).join("").toUpperCase();return e.jsxs("article",{className:b,role:"article","aria-label":`Candidat ${a}`,children:[e.jsxs("header",{className:"candidate-card-header",children:[e.jsx("div",{className:"candidate-card-avatar","aria-hidden":"true",children:P}),e.jsxs("div",{className:"candidate-card-identity",children:[e.jsx("h3",{className:"candidate-card-name",children:a}),e.jsx("p",{className:"candidate-card-role",children:A})]}),typeof l=="number"&&e.jsx("div",{className:"candidate-card-score",children:e.jsx(_,{value:l,label:"Match",size:"small"})})]}),e.jsxs("dl",{className:"candidate-card-meta",children:[e.jsxs("div",{className:"candidate-card-meta-row",children:[e.jsx("dt",{className:"candidate-card-meta-label",children:"Expérience"}),e.jsx("dd",{className:"candidate-card-meta-value",children:V})]}),d&&e.jsxs("div",{className:"candidate-card-meta-row",children:[e.jsx("dt",{className:"candidate-card-meta-label",children:"Localisation"}),e.jsx("dd",{className:"candidate-card-meta-value",children:d})]}),e.jsxs("div",{className:"candidate-card-meta-row",children:[e.jsx("dt",{className:"candidate-card-meta-label",children:"Contrat"}),e.jsx("dd",{className:"candidate-card-meta-value",children:e.jsx("span",{className:w,children:s})})]})]}),m&&e.jsx("footer",{className:"candidate-card-footer",children:e.jsx(M,{variant:"secondary",size:"small",onClick:m,children:"Voir le profil"})})]})}try{n.displayName="CandidateCard",n.__docgenInfo={description:`CandidateCard — French HR candidate display.

Shows name, role, experience, contract preference, location, and an
optional matching score. Token-only styling, light + dark.`,displayName:"CandidateCard",props:{name:{defaultValue:null,description:"Candidate full name",name:"name",required:!0,type:{name:"string"}},role:{defaultValue:null,description:"Candidate role / job title",name:"role",required:!0,type:{name:"string"}},experience:{defaultValue:null,description:'Experience expressed in French (e.g. "5 ans")',name:"experience",required:!0,type:{name:"string"}},contractType:{defaultValue:null,description:"French HR contract type",name:"contractType",required:!0,type:{name:"enum",value:[{value:'"CDI"'},{value:'"CDD"'},{value:'"CDIC"'},{value:'"Freelance"'},{value:'"Interim"'},{value:'"Portage"'},{value:'"Auto"'}]}},location:{defaultValue:null,description:"Optional location string",name:"location",required:!1,type:{name:"string"}},avatarInitials:{defaultValue:null,description:"Optional avatar initials (1-3 chars)",name:"avatarInitials",required:!1,type:{name:"string"}},score:{defaultValue:null,description:"Optional 0-100 matching score",name:"score",required:!1,type:{name:"number"}},onView:{defaultValue:null,description:'Click handler for the "Voir le profil" action',name:"onView",required:!1,type:{name:"(() => void)"}},className:{defaultValue:{value:""},description:"Additional CSS class names",name:"className",required:!1,type:{name:"string"}}}}}catch{}const U={title:"ERP/CandidateCard",component:n,parameters:{layout:"padded",docs:{description:{component:"French HR candidate card. Renders identity, contract preference, experience, and an optional matching score."}}},tags:["autodocs"],argTypes:{contractType:{control:"select",options:["CDI","CDD","CDIC","Freelance","Interim","Portage","Auto"]}}},r={args:{name:"Amélie Dubois",role:"Développeuse Full-Stack Senior",experience:"8 ans",contractType:"CDI",location:"Paris, Île-de-France",score:92,onView:()=>{}}},t={args:{name:"Mathieu Lefèvre",role:"Consultant DevOps",experience:"12 ans",contractType:"Freelance",location:"Lyon, Auvergne-Rhône-Alpes",score:86,onView:()=>{}}},c={args:{name:"Sophie Marchand",role:"Chargée de recrutement",experience:"4 ans",contractType:"CDD",location:"Bordeaux, Nouvelle-Aquitaine",onView:()=>{}}},o={render:()=>e.jsxs("div",{className:"stories-row",children:[e.jsx(n,{name:"Léa Martin",role:"Data Scientist",experience:"6 ans",contractType:"CDI",location:"Paris",score:94}),e.jsx(n,{name:"Hugo Bernard",role:"Ingénieur QA",experience:"3 ans",contractType:"Interim",location:"Marseille",score:71}),e.jsx(n,{name:"Inès Petit",role:"Designer UX",experience:"5 ans",contractType:"Portage",location:"Nantes",score:88})]})},i={args:{name:"Amélie Dubois",role:"Développeuse Full-Stack Senior",experience:"8 ans",contractType:"CDI",location:"Paris, Île-de-France",score:92,onView:()=>{}},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[a=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(a,{}))]};var u,p,h;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    name: 'Amélie Dubois',
    role: 'Développeuse Full-Stack Senior',
    experience: '8 ans',
    contractType: 'CDI',
    location: 'Paris, Île-de-France',
    score: 92,
    onView: () => undefined
  }
}`,...(h=(p=r.parameters)==null?void 0:p.docs)==null?void 0:h.source}}};var C,x,g;t.parameters={...t.parameters,docs:{...(C=t.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    name: 'Mathieu Lefèvre',
    role: 'Consultant DevOps',
    experience: '12 ans',
    contractType: 'Freelance',
    location: 'Lyon, Auvergne-Rhône-Alpes',
    score: 86,
    onView: () => undefined
  }
}`,...(g=(x=t.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var f,y,v;c.parameters={...c.parameters,docs:{...(f=c.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    name: 'Sophie Marchand',
    role: 'Chargée de recrutement',
    experience: '4 ans',
    contractType: 'CDD',
    location: 'Bordeaux, Nouvelle-Aquitaine',
    onView: () => undefined
  }
}`,...(v=(y=c.parameters)==null?void 0:y.docs)==null?void 0:v.source}}};var D,j,N;o.parameters={...o.parameters,docs:{...(D=o.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => <div className="stories-row">\r
      <CandidateCard name="Léa Martin" role="Data Scientist" experience="6 ans" contractType="CDI" location="Paris" score={94} />\r
      <CandidateCard name="Hugo Bernard" role="Ingénieur QA" experience="3 ans" contractType="Interim" location="Marseille" score={71} />\r
      <CandidateCard name="Inès Petit" role="Designer UX" experience="5 ans" contractType="Portage" location="Nantes" score={88} />\r
    </div>
}`,...(N=(j=o.parameters)==null?void 0:j.docs)==null?void 0:N.source}}};var S,I,T;i.parameters={...i.parameters,docs:{...(S=i.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    name: 'Amélie Dubois',
    role: 'Développeuse Full-Stack Senior',
    experience: '8 ans',
    contractType: 'CDI',
    location: 'Paris, Île-de-France',
    score: 92,
    onView: () => undefined
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
}`,...(T=(I=i.parameters)==null?void 0:I.docs)==null?void 0:T.source}}};const z=["Default","Freelance","WithoutScore","ContractTypes","DarkMode"];export{o as ContractTypes,i as DarkMode,r as Default,t as Freelance,c as WithoutScore,z as __namedExportsOrder,U as default};
