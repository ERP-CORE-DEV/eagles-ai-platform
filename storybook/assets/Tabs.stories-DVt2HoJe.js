import{j as s}from"./jsx-runtime-Z5uAzocK.js";import{r as d}from"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function k({tabs:n,activeId:h,defaultActiveId:K,onChange:l,className:O=""}){var A,T;const c=d.useId(),B=((A=n.find(e=>!e.disabled))==null?void 0:A.id)??((T=n[0])==null?void 0:T.id)??"",[L,M]=d.useState(K??B),u=h??L,y=d.useRef({}),o=d.useCallback(e=>{h===void 0&&M(e),l==null||l(e)},[h,l]),i=d.useCallback(e=>{const a=y.current[e];a&&a.focus()},[]),I=d.useCallback(e=>{const a=n.filter(x=>!x.disabled);if(a.length===0)return;const t=a.findIndex(x=>x.id===u),g=((t===-1?0:t)+e+a.length)%a.length,D=a[g].id;o(D),i(D)},[n,u,o,i]),W=d.useCallback(e=>{const a=n.filter(t=>!t.disabled);if(a.length!==0)switch(e.key){case"ArrowRight":{e.preventDefault(),I(1);break}case"ArrowLeft":{e.preventDefault(),I(-1);break}case"Home":{e.preventDefault();const t=a[0].id;o(t),i(t);break}case"End":{e.preventDefault();const t=a[a.length-1].id;o(t),i(t);break}}},[n,I,o,i]),z=["tabs",O].filter(Boolean).join(" ");return s.jsxs("div",{className:z,children:[s.jsx("div",{role:"tablist","aria-orientation":"horizontal",className:"tabs-list",children:n.map(e=>{const a=`${c}-tab-${e.id}`,t=`${c}-panel-${e.id}`,r=e.id===u;return s.jsx("button",{ref:g=>{y.current[e.id]=g},type:"button",role:"tab",id:a,"aria-selected":r,"aria-controls":t,"aria-disabled":e.disabled||void 0,tabIndex:r?0:-1,disabled:e.disabled,className:["tabs-tab",r?"tabs-tab-selected":"",e.disabled?"tabs-tab-disabled":""].filter(Boolean).join(" "),onClick:()=>{e.disabled||o(e.id)},onKeyDown:W,children:e.label},e.id)})}),n.map(e=>{const a=`${c}-tab-${e.id}`,t=`${c}-panel-${e.id}`,r=e.id===u;return s.jsx("div",{role:"tabpanel",id:t,"aria-labelledby":a,hidden:!r,tabIndex:0,className:"tabs-panel",children:r?e.content:null},e.id)})]})}try{k.displayName="Tabs",k.__docgenInfo={description:`Tabs — accessible tablist with keyboard navigation.

Supports controlled (activeId) and uncontrolled (defaultActiveId) modes.
Keyboard: Left/Right arrows move focus, Home/End jump to first/last,
Space/Enter activate. Disabled tabs are skipped during keyboard navigation.`,displayName:"Tabs",props:{tabs:{defaultValue:null,description:"Tab definitions",name:"tabs",required:!0,type:{name:"TabItem[]"}},activeId:{defaultValue:null,description:"Controlled active tab id",name:"activeId",required:!1,type:{name:"string"}},defaultActiveId:{defaultValue:null,description:"Initial uncontrolled active tab id",name:"defaultActiveId",required:!1,type:{name:"string"}},onChange:{defaultValue:null,description:"Change handler — fires for both controlled and uncontrolled mode",name:"onChange",required:!1,type:{name:"((id: string) => void)"}},className:{defaultValue:{value:""},description:"Additional CSS class names",name:"className",required:!1,type:{name:"string"}}}}}catch{}const J={title:"Navigation/Tabs",component:k,parameters:{layout:"padded",docs:{description:{component:"Accessible tablist with full keyboard navigation. Supports controlled and uncontrolled modes."}}},tags:["autodocs"]},v=[{id:"profile",label:"Profil",content:s.jsx("p",{children:"Informations personnelles du candidat."})},{id:"experience",label:"Expérience",content:s.jsx("p",{children:"Historique professionnel et compétences."})},{id:"documents",label:"Documents",content:s.jsx("p",{children:"CV, lettres de motivation et certifications."})}],p={args:{tabs:v,defaultActiveId:"profile"}},b={args:{tabs:[...v,{id:"archived",label:"Archivé",content:s.jsx("p",{children:"Données archivées."}),disabled:!0}],defaultActiveId:"profile"}},m={args:{tabs:v,defaultActiveId:"experience"}},f={args:{tabs:v,defaultActiveId:"profile"},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[n=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),s.jsx(n,{}))]};var S,j,E;p.parameters={...p.parameters,docs:{...(S=p.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    tabs: baseTabs,
    defaultActiveId: 'profile'
  }
}`,...(E=(j=p.parameters)==null?void 0:j.docs)==null?void 0:E.source}}};var _,N,w;b.parameters={...b.parameters,docs:{...(_=b.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    tabs: [...baseTabs, {
      id: 'archived',
      label: 'Archivé',
      content: <p>Données archivées.</p>,
      disabled: true
    }],
    defaultActiveId: 'profile'
  }
}`,...(w=(N=b.parameters)==null?void 0:N.docs)==null?void 0:w.source}}};var $,q,C;m.parameters={...m.parameters,docs:{...($=m.parameters)==null?void 0:$.docs,source:{originalSource:`{
  args: {
    tabs: baseTabs,
    defaultActiveId: 'experience'
  }
}`,...(C=(q=m.parameters)==null?void 0:q.docs)==null?void 0:C.source}}};var V,R,H;f.parameters={...f.parameters,docs:{...(V=f.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    tabs: baseTabs,
    defaultActiveId: 'profile'
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
}`,...(H=(R=f.parameters)==null?void 0:R.docs)==null?void 0:H.source}}};const Q=["Default","WithDisabledTab","StartOnSecondTab","DarkMode"];export{f as DarkMode,p as Default,m as StartOnSecondTab,b as WithDisabledTab,Q as __namedExportsOrder,J as default};
