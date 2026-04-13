import{j as e}from"./jsx-runtime-Z5uAzocK.js";import{B as L}from"./Button-BDYnqn9u.js";import{S as O}from"./ScoreBadge-BktA-Ma3.js";import"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";const V={CDI:"job-card-contract-cdi",CDD:"job-card-contract-cdd",CDIC:"job-card-contract-cdic",Freelance:"job-card-contract-freelance",Interim:"job-card-contract-interim",Portage:"job-card-contract-portage",Auto:"job-card-contract-auto"};function J(a,r){return a==null&&r==null?null:a!=null&&r!=null?`${a}-${r}k€/an`:a!=null?`À partir de ${a}k€/an`:`Jusqu'à ${r}k€/an`}function n({title:a,company:r,location:N,contractType:i,salaryMin:I,salaryMax:P,postedAgo:k,matchScore:d,onApply:u,className:q=""}){const R=["job-card",q].filter(Boolean).join(" "),F=["job-card-contract",V[i]].join(" "),p=J(I,P);return e.jsxs("article",{className:R,role:"article","aria-label":`Offre ${a} chez ${r}`,children:[e.jsxs("header",{className:"job-card-header",children:[e.jsxs("div",{className:"job-card-identity",children:[e.jsx("h3",{className:"job-card-title",children:a}),e.jsx("p",{className:"job-card-company",children:r})]}),typeof d=="number"&&e.jsx("div",{className:"job-card-score",children:e.jsx(O,{value:d,label:"Match",size:"small"})})]}),e.jsxs("div",{className:"job-card-tags",children:[e.jsx("span",{className:F,children:i}),e.jsx("span",{className:"job-card-tag",children:N}),p&&e.jsx("span",{className:"job-card-tag",children:p})]}),e.jsxs("footer",{className:"job-card-footer",children:[e.jsx("span",{className:"job-card-posted",children:k}),u&&e.jsx(L,{variant:"primary",size:"small",onClick:u,children:"Postuler"})]})]})}try{n.displayName="JobCard",n.__docgenInfo={description:`JobCard — French job posting display.

Shows title, company, location, contract pill, salary range, and an
optional matching score. Token-only styling, light + dark.`,displayName:"JobCard",props:{title:{defaultValue:null,description:"Job title",name:"title",required:!0,type:{name:"string"}},company:{defaultValue:null,description:"Hiring company name",name:"company",required:!0,type:{name:"string"}},location:{defaultValue:null,description:"Job location (city, region)",name:"location",required:!0,type:{name:"string"}},contractType:{defaultValue:null,description:"French HR contract type",name:"contractType",required:!0,type:{name:"enum",value:[{value:'"CDI"'},{value:'"CDD"'},{value:'"CDIC"'},{value:'"Freelance"'},{value:'"Interim"'},{value:'"Portage"'},{value:'"Auto"'}]}},salaryMin:{defaultValue:null,description:"Optional minimum salary in thousands of euros",name:"salaryMin",required:!1,type:{name:"number"}},salaryMax:{defaultValue:null,description:"Optional maximum salary in thousands of euros",name:"salaryMax",required:!1,type:{name:"number"}},postedAgo:{defaultValue:null,description:'Posted date in human-readable form (e.g. "il y a 3 jours")',name:"postedAgo",required:!0,type:{name:"string"}},matchScore:{defaultValue:null,description:"Optional 0-100 matching score",name:"matchScore",required:!1,type:{name:"number"}},onApply:{defaultValue:null,description:'Click handler for the "Postuler" action',name:"onApply",required:!1,type:{name:"(() => void)"}},className:{defaultValue:{value:""},description:"Additional CSS class names",name:"className",required:!1,type:{name:"string"}}}}}catch{}const H={title:"ERP/JobCard",component:n,parameters:{layout:"padded",docs:{description:{component:"French job posting card. Renders title, company, location, contract pill, salary range, and an optional matching score."}}},tags:["autodocs"],argTypes:{contractType:{control:"select",options:["CDI","CDD","CDIC","Freelance","Interim","Portage","Auto"]}}},o={args:{title:"Lead Développeur React",company:"OptimERP SAS",location:"Paris, Île-de-France",contractType:"CDI",salaryMin:55,salaryMax:70,postedAgo:"il y a 3 jours",matchScore:91,onApply:()=>{}}},t={args:{title:"Architecte Cloud Azure",company:"Banque Lambert & Fils",location:"Lyon, Auvergne-Rhône-Alpes",contractType:"Freelance",salaryMin:650,salaryMax:750,postedAgo:"il y a 1 jour",matchScore:84,onApply:()=>{}}},s={args:{title:"Chargé de mission RH",company:"Mairie de Bordeaux",location:"Bordeaux, Nouvelle-Aquitaine",contractType:"CDD",postedAgo:"il y a 1 semaine",onApply:()=>{}}},c={render:()=>e.jsxs("div",{className:"stories-row",children:[e.jsx(n,{title:"Ingénieur DevOps",company:"StartCloud",location:"Toulouse",contractType:"CDI",salaryMin:50,salaryMax:65,postedAgo:"il y a 2 jours",matchScore:88}),e.jsx(n,{title:"Consultant SAP",company:"Conseil Plus",location:"Nantes",contractType:"Portage",salaryMin:500,salaryMax:600,postedAgo:"il y a 5 jours",matchScore:76}),e.jsx(n,{title:"Technicien support",company:"Industrie Métallique",location:"Lille",contractType:"Interim",salaryMin:28,salaryMax:32,postedAgo:"il y a 6 heures",matchScore:62})]})},l={args:{title:"Lead Développeur React",company:"OptimERP SAS",location:"Paris, Île-de-France",contractType:"CDI",salaryMin:55,salaryMax:70,postedAgo:"il y a 3 jours",matchScore:91,onApply:()=>{}},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[a=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(a,{}))]};var m,y,g;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    title: 'Lead Développeur React',
    company: 'OptimERP SAS',
    location: 'Paris, Île-de-France',
    contractType: 'CDI',
    salaryMin: 55,
    salaryMax: 70,
    postedAgo: 'il y a 3 jours',
    matchScore: 91,
    onApply: () => undefined
  }
}`,...(g=(y=o.parameters)==null?void 0:y.docs)==null?void 0:g.source}}};var h,j,f;t.parameters={...t.parameters,docs:{...(h=t.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    title: 'Architecte Cloud Azure',
    company: 'Banque Lambert & Fils',
    location: 'Lyon, Auvergne-Rhône-Alpes',
    contractType: 'Freelance',
    salaryMin: 650,
    salaryMax: 750,
    postedAgo: 'il y a 1 jour',
    matchScore: 84,
    onApply: () => undefined
  }
}`,...(f=(j=t.parameters)==null?void 0:j.docs)==null?void 0:f.source}}};var A,b,C;s.parameters={...s.parameters,docs:{...(A=s.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    title: 'Chargé de mission RH',
    company: 'Mairie de Bordeaux',
    location: 'Bordeaux, Nouvelle-Aquitaine',
    contractType: 'CDD',
    postedAgo: 'il y a 1 semaine',
    onApply: () => undefined
  }
}`,...(C=(b=s.parameters)==null?void 0:b.docs)==null?void 0:C.source}}};var S,x,M;c.parameters={...c.parameters,docs:{...(S=c.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <div className="stories-row">\r
      <JobCard title="Ingénieur DevOps" company="StartCloud" location="Toulouse" contractType="CDI" salaryMin={50} salaryMax={65} postedAgo="il y a 2 jours" matchScore={88} />\r
      <JobCard title="Consultant SAP" company="Conseil Plus" location="Nantes" contractType="Portage" salaryMin={500} salaryMax={600} postedAgo="il y a 5 jours" matchScore={76} />\r
      <JobCard title="Technicien support" company="Industrie Métallique" location="Lille" contractType="Interim" salaryMin={28} salaryMax={32} postedAgo="il y a 6 heures" matchScore={62} />\r
    </div>
}`,...(M=(x=c.parameters)==null?void 0:x.docs)==null?void 0:M.source}}};var v,D,T;l.parameters={...l.parameters,docs:{...(v=l.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    title: 'Lead Développeur React',
    company: 'OptimERP SAS',
    location: 'Paris, Île-de-France',
    contractType: 'CDI',
    salaryMin: 55,
    salaryMax: 70,
    postedAgo: 'il y a 3 jours',
    matchScore: 91,
    onApply: () => undefined
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
}`,...(T=(D=l.parameters)==null?void 0:D.docs)==null?void 0:T.source}}};const w=["Default","FreelanceMission","WithoutSalary","Variants","DarkMode"];export{l as DarkMode,o as Default,t as FreelanceMission,c as Variants,s as WithoutSalary,w as __namedExportsOrder,H as default};
