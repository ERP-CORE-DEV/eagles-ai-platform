import{j as a}from"./jsx-runtime-Z5uAzocK.js";import{r as o}from"./index-pP6CS22B.js";import{B as M}from"./Button-BDYnqn9u.js";import"./_commonjsHelpers-Cpj98o6Y.js";const N=["csv","pdf","xlsx"],P={csv:"CSV (.csv)",pdf:"PDF (.pdf)",xlsx:"Excel (.xlsx)"};function E({onExport:e,formats:i=N,label:F="Exporter",disabled:c=!1}){const g=`${o.useId()}-menu`,[n,u]=o.useState(!1),[p,y]=o.useState(!1),m=o.useRef(null),f=o.useCallback(()=>{u(!1)},[]),R=o.useCallback(()=>{c||p||u(t=>!t)},[c,p]),I=o.useCallback(async t=>{u(!1),y(!0);try{await e(t)}finally{y(!1)}},[e]);return o.useEffect(()=>{if(!n)return;const t=x=>{const v=x.target;m.current&&v&&!m.current.contains(v)&&f()},h=x=>{x.key==="Escape"&&f()};return document.addEventListener("mousedown",t),document.addEventListener("keydown",h),()=>{document.removeEventListener("mousedown",t),document.removeEventListener("keydown",h)}},[n,f]),a.jsxs("div",{className:"export-button",ref:m,children:[a.jsx(M,{variant:"secondary",size:"medium",loading:p,disabled:c,"aria-haspopup":"menu","aria-expanded":n,"aria-controls":g,onClick:R,children:F}),n&&a.jsx("div",{id:g,role:"menu","aria-label":"Choisir un format d'export",className:"export-button-menu",children:i.map(t=>a.jsx("button",{type:"button",role:"menuitem",className:"export-button-item",onClick:()=>{I(t)},children:P[t]},t))})]})}try{E.displayName="ExportButton",E.__docgenInfo={description:"ExportButton — trigger button that opens a popover with format choices.\n\nComposes the base `Button` component. On format selection, calls `onExport`\nwith the chosen format and shows a transient loading state until the\npromise resolves. Token-only styling, light + dark.",displayName:"ExportButton",props:{onExport:{defaultValue:null,description:"Called with the chosen format. May return a promise; the button shows a loading state until it resolves.",name:"onExport",required:!0,type:{name:"(format: ExportFormat) => void | Promise<void>"}},formats:{defaultValue:{value:"['csv', 'pdf', 'xlsx']"},description:"Allowed export formats — defaults to all three",name:"formats",required:!1,type:{name:"ExportFormat[]"}},label:{defaultValue:{value:"Exporter"},description:"Visible label on the trigger button",name:"label",required:!1,type:{name:"string"}},disabled:{defaultValue:{value:"false"},description:"Disables the trigger button",name:"disabled",required:!1,type:{name:"boolean"}}}}}catch{}const $={title:"ERP/ExportButton",component:E,parameters:{layout:"centered",docs:{description:{component:"Composes the base Button. Click opens a popover with the available formats; selection invokes onExport and shows a transient loading state."}}},tags:["autodocs"]};function b(e){return new Promise(i=>{setTimeout(i,e)})}const r={args:{label:"Exporter la liste candidats",onExport:async e=>{await b(800),console.log("Exported as",e)}}},s={args:{label:"Exporter (CSV)",formats:["csv"],onExport:async e=>{await b(500),console.log("Exported as",e)}}},l={args:{label:"Exporter",disabled:!0,onExport:()=>{}}},d={args:{label:"Exporter la liste candidats",onExport:async e=>{await b(800),console.log("Exported as",e)}},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[e=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),a.jsx(e,{}))]};var k,w,C;r.parameters={...r.parameters,docs:{...(k=r.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    label: 'Exporter la liste candidats',
    onExport: async format => {
      await delay(800);
      // eslint-disable-next-line no-console
      console.log('Exported as', format);
    }
  }
}`,...(C=(w=r.parameters)==null?void 0:w.docs)==null?void 0:C.source}}};var S,_,D;s.parameters={...s.parameters,docs:{...(S=s.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    label: 'Exporter (CSV)',
    formats: ['csv'],
    onExport: async format => {
      await delay(500);
      // eslint-disable-next-line no-console
      console.log('Exported as', format);
    }
  }
}`,...(D=(_=s.parameters)==null?void 0:_.docs)==null?void 0:D.source}}};var B,L,V;l.parameters={...l.parameters,docs:{...(B=l.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    label: 'Exporter',
    disabled: true,
    onExport: () => undefined
  }
}`,...(V=(L=l.parameters)==null?void 0:L.docs)==null?void 0:V.source}}};var j,A,O;d.parameters={...d.parameters,docs:{...(j=d.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    label: 'Exporter la liste candidats',
    onExport: async format => {
      await delay(800);
      // eslint-disable-next-line no-console
      console.log('Exported as', format);
    }
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
}`,...(O=(A=d.parameters)==null?void 0:A.docs)==null?void 0:O.source}}};const G=["Default","CsvOnly","Disabled","DarkMode"];export{s as CsvOnly,d as DarkMode,r as Default,l as Disabled,G as __namedExportsOrder,$ as default};
