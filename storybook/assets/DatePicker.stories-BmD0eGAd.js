import{j as a}from"./jsx-runtime-Z5uAzocK.js";import{r as l}from"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function t({value:e,defaultValue:r,onChange:m,min:O,max:N,label:p,error:n,disabled:y=!1,required:f=!1,id:w,"aria-label":W}){const L=l.useId(),b=w??L,v=`${b}-error`,[T,H]=l.useState(r??""),h=e!==void 0,A=h?e:T,B=d=>{h||H(d),m==null||m(d)},R=["date-picker",n?"date-picker-invalid":"",y?"date-picker-disabled":""].filter(Boolean).join(" ");return a.jsxs("div",{className:R,children:[p&&a.jsxs("label",{className:"date-picker-label",htmlFor:b,children:[p,f&&a.jsx("span",{className:"date-picker-required","aria-hidden":"true",children:" *"})]}),a.jsx("input",{id:b,type:"date",className:"date-picker-input",value:A,min:O,max:N,disabled:y,required:f,"aria-invalid":n?"true":void 0,"aria-describedby":n?v:void 0,"aria-required":f||void 0,"aria-label":p?void 0:W,onChange:d=>B(d.target.value)}),n&&a.jsx("p",{id:v,className:"date-picker-error",role:"alert",children:n})]})}try{t.displayName="DatePicker",t.__docgenInfo={description:`DatePicker — date selector built on the native HTML date input.

Mirrors FormField label/error rendering. Works in controlled (value +
onChange) or uncontrolled (defaultValue) mode. Format is always ISO
yyyy-mm-dd as defined by the HTML date input spec.`,displayName:"DatePicker",props:{value:{defaultValue:null,description:"Selected date as ISO yyyy-mm-dd (controlled)",name:"value",required:!1,type:{name:"string"}},defaultValue:{defaultValue:null,description:"Initial date (uncontrolled)",name:"defaultValue",required:!1,type:{name:"string"}},onChange:{defaultValue:null,description:"Change handler — receives the new ISO date string",name:"onChange",required:!1,type:{name:"((value: string) => void)"}},min:{defaultValue:null,description:"Minimum selectable date (ISO yyyy-mm-dd)",name:"min",required:!1,type:{name:"string"}},max:{defaultValue:null,description:"Maximum selectable date (ISO yyyy-mm-dd)",name:"max",required:!1,type:{name:"string"}},label:{defaultValue:null,description:"Field label rendered above the input",name:"label",required:!1,type:{name:"string"}},error:{defaultValue:null,description:"Error message — replaces hint and sets aria-invalid",name:"error",required:!1,type:{name:"string"}},disabled:{defaultValue:{value:"false"},description:"Disabled state",name:"disabled",required:!1,type:{name:"boolean"}},required:{defaultValue:{value:"false"},description:"Whether the field is required",name:"required",required:!1,type:{name:"boolean"}},id:{defaultValue:null,description:"Stable id for label association (auto-generated when omitted)",name:"id",required:!1,type:{name:"string"}},"aria-label":{defaultValue:null,description:"Optional accessible label when no visible label is provided",name:"aria-label",required:!1,type:{name:"string"}}}}}catch{}const J={title:"Forms/DatePicker",component:t,parameters:{layout:"padded",docs:{description:{component:"Date selector built on the native HTML date input. Mirrors FormField label/error rendering. Format is ISO yyyy-mm-dd."}}},tags:["autodocs"],argTypes:{disabled:{control:"boolean"},required:{control:"boolean"}}},s={render:()=>{const[e,r]=l.useState("2026-04-15");return a.jsx(t,{label:"Start date",value:e,onChange:r})}},i={render:()=>{const[e,r]=l.useState("2026-06-01");return a.jsx(t,{label:"Interview date",value:e,onChange:r,min:"2026-05-01",max:"2026-07-31",required:!0})}},o={render:()=>{const[e,r]=l.useState("2020-01-01");return a.jsx(t,{label:"Contract end date",value:e,onChange:r,error:"End date must be in the future"})}},u={render:()=>a.jsx(t,{label:"Locked date",defaultValue:"2026-03-15",disabled:!0})},c={render:()=>{const[e,r]=l.useState("2026-04-15");return a.jsx(t,{label:"Start date",value:e,onChange:r})},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[e=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),a.jsx(e,{}))]};var g,V,k;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('2026-04-15');
    return <DatePicker label="Start date" value={value} onChange={setValue} />;
  }
}`,...(k=(V=s.parameters)==null?void 0:V.docs)==null?void 0:k.source}}};var S,x,D;i.parameters={...i.parameters,docs:{...(S=i.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('2026-06-01');
    return <DatePicker label="Interview date" value={value} onChange={setValue} min="2026-05-01" max="2026-07-31" required />;
  }
}`,...(D=(x=i.parameters)==null?void 0:x.docs)==null?void 0:D.source}}};var q,j,C;o.parameters={...o.parameters,docs:{...(q=o.parameters)==null?void 0:q.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('2020-01-01');
    return <DatePicker label="Contract end date" value={value} onChange={setValue} error="End date must be in the future" />;
  }
}`,...(C=(j=o.parameters)==null?void 0:j.docs)==null?void 0:C.source}}};var I,M,E;u.parameters={...u.parameters,docs:{...(I=u.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: () => <DatePicker label="Locked date" defaultValue="2026-03-15" disabled />
}`,...(E=(M=u.parameters)==null?void 0:M.docs)==null?void 0:E.source}}};var P,_,F;c.parameters={...c.parameters,docs:{...(P=c.parameters)==null?void 0:P.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('2026-04-15');
    return <DatePicker label="Start date" value={value} onChange={setValue} />;
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
}`,...(F=(_=c.parameters)==null?void 0:_.docs)==null?void 0:F.source}}};const K=["Default","WithMinMax","WithError","Disabled","DarkMode"];export{c as DarkMode,s as Default,u as Disabled,o as WithError,i as WithMinMax,K as __namedExportsOrder,J as default};
