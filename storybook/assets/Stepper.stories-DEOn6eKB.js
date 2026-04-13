import{j as e}from"./jsx-runtime-Z5uAzocK.js";import{r as F}from"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function l({steps:s,currentIndex:u,onStepClick:n,className:V=""}){const q=["stepper",V].filter(Boolean).join(" "),w=typeof n=="function";return e.jsx("ol",{className:q,"aria-label":"Progression",children:s.map((r,t)=>{const D=t<u,m=t===u,L=m?"stepper-step-current":D?"stepper-step-complete":"stepper-step-upcoming",A=`Étape ${t+1}: ${r.label}`;return e.jsxs(F.Fragment,{children:[e.jsx("li",{className:["stepper-step",L].join(" "),"aria-current":m?"step":void 0,children:w?e.jsxs("button",{type:"button",className:"stepper-step-button","aria-label":A,onClick:()=>n==null?void 0:n(t),children:[e.jsx("span",{className:"stepper-step-indicator","aria-hidden":"true",children:t+1}),e.jsxs("span",{className:"stepper-step-text",children:[e.jsx("span",{className:"stepper-step-label",children:r.label}),r.description&&e.jsx("span",{className:"stepper-step-description",children:r.description})]})]}):e.jsxs("div",{className:"stepper-step-static",children:[e.jsx("span",{className:"stepper-step-indicator","aria-hidden":"true",children:t+1}),e.jsxs("span",{className:"stepper-step-text",children:[e.jsx("span",{className:"stepper-step-label",children:r.label}),r.description&&e.jsx("span",{className:"stepper-step-description",children:r.description})]})]})}),t<s.length-1&&e.jsx("li",{className:"stepper-connector","aria-hidden":"true",role:"presentation"})]},r.id)})})}try{l.displayName="Stepper",l.__docgenInfo={description:`Stepper — linear progress through a sequence of steps.

Steps before currentIndex are completed, the step at currentIndex is current
(aria-current="step"), and steps after are upcoming. Provide onStepClick to
make steps navigable.`,displayName:"Stepper",props:{steps:{defaultValue:null,description:"Ordered list of steps",name:"steps",required:!0,type:{name:"StepperStep[]"}},currentIndex:{defaultValue:null,description:"Zero-based index of the current step",name:"currentIndex",required:!0,type:{name:"number"}},onStepClick:{defaultValue:null,description:"Click handler for navigating to a step. When omitted, steps are not interactive.",name:"onStepClick",required:!1,type:{name:"((index: number) => void)"}},className:{defaultValue:{value:""},description:"Additional CSS class names",name:"className",required:!1,type:{name:"string"}}}}}catch{}const $={title:"Navigation/Stepper",component:l,parameters:{layout:"padded",docs:{description:{component:'Linear progress indicator for multi-step workflows. Marks current step with aria-current="step".'}}},tags:["autodocs"]},a=[{id:"identity",label:"Identité",description:"Informations personnelles"},{id:"experience",label:"Expérience",description:"Parcours professionnel"},{id:"skills",label:"Compétences",description:"Savoir-faire et certifications"},{id:"review",label:"Validation",description:"Vérification finale"}],p={args:{steps:a,currentIndex:1}},o={args:{steps:a,currentIndex:0}},c={args:{steps:a,currentIndex:3}},i={args:{steps:a,currentIndex:2,onStepClick:s=>{console.log("Step clicked",s)}}},d={args:{steps:a,currentIndex:1},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[s=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),e.jsx(s,{}))]};var f,x,g;p.parameters={...p.parameters,docs:{...(f=p.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    steps: baseSteps,
    currentIndex: 1
  }
}`,...(g=(x=p.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var b,S,h;o.parameters={...o.parameters,docs:{...(b=o.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    steps: baseSteps,
    currentIndex: 0
  }
}`,...(h=(S=o.parameters)==null?void 0:S.docs)==null?void 0:h.source}}};var j,k,I;c.parameters={...c.parameters,docs:{...(j=c.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    steps: baseSteps,
    currentIndex: 3
  }
}`,...(I=(k=c.parameters)==null?void 0:k.docs)==null?void 0:I.source}}};var N,y,v;i.parameters={...i.parameters,docs:{...(N=i.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    steps: baseSteps,
    currentIndex: 2,
    onStepClick: (index: number) => {
      // eslint-disable-next-line no-console
      console.log('Step clicked', index);
    }
  }
}`,...(v=(y=i.parameters)==null?void 0:y.docs)==null?void 0:v.source}}};var _,C,E;d.parameters={...d.parameters,docs:{...(_=d.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    steps: baseSteps,
    currentIndex: 1
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
}`,...(E=(C=d.parameters)==null?void 0:C.docs)==null?void 0:E.source}}};const B=["Default","FirstStep","LastStep","Interactive","DarkMode"];export{d as DarkMode,p as Default,o as FirstStep,i as Interactive,c as LastStep,B as __namedExportsOrder,$ as default};
