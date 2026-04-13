import{j as l}from"./jsx-runtime-Z5uAzocK.js";import{r as t}from"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";function E({trigger:m,items:a,align:W="start",triggerLabel:z,className:G=""}){const I=t.useId(),w=`${I}-menu`,C=`${I}-trigger`,[i,S]=t.useState(!1),A=t.useRef(null),L=t.useRef(null),c=t.useRef([]),[g,u]=t.useState(-1),o=t.useCallback(e=>{var r;S(!1),u(-1),e&&((r=L.current)==null||r.focus())},[]),p=t.useCallback(()=>a.findIndex(e=>!e.disabled),[a]),b=t.useCallback(()=>{for(let e=a.length-1;e>=0;e-=1)if(!a[e].disabled)return e;return-1},[a]),D=t.useCallback(e=>{var s;if(a.length===0)return;let n=g===-1?e===1?-1:a.length:g;for(let O=0;O<a.length;O+=1)if(n=(n+e+a.length)%a.length,!a[n].disabled){u(n),(s=c.current[n])==null||s.focus();return}},[a,g]),f=t.useCallback(e=>{if(S(!0),e){const r=p();u(r),requestAnimationFrame(()=>{var n;r>=0&&((n=c.current[r])==null||n.focus())})}},[p]),J=t.useCallback(()=>{i?o(!1):f(!1)},[i,o,f]),Q=t.useCallback(e=>{if(e.key==="ArrowDown"||e.key==="Enter"||e.key===" ")e.preventDefault(),f(!0);else if(e.key==="ArrowUp"){e.preventDefault(),S(!0);const r=b();u(r),requestAnimationFrame(()=>{var n;r>=0&&((n=c.current[r])==null||n.focus())})}},[f,b]),X=t.useCallback(e=>{var r,n;switch(e.key){case"Escape":{e.preventDefault(),o(!0);break}case"ArrowDown":{e.preventDefault(),D(1);break}case"ArrowUp":{e.preventDefault(),D(-1);break}case"Home":{e.preventDefault();const s=p();s>=0&&(u(s),(r=c.current[s])==null||r.focus());break}case"End":{e.preventDefault();const s=b();s>=0&&(u(s),(n=c.current[s])==null||n.focus());break}case"Tab":{o(!1);break}}},[o,D,p,b]);t.useEffect(()=>{if(!i)return;const e=r=>{const n=r.target;A.current&&n&&!A.current.contains(n)&&o(!1)};return document.addEventListener("mousedown",e),()=>{document.removeEventListener("mousedown",e)}},[i,o]);const Y=t.useCallback(e=>{e.disabled||(e.onSelect(),o(!0))},[o]),Z=["menu",`menu-align-${W}`,i?"menu-open":"",G].filter(Boolean).join(" ");return l.jsxs("div",{className:Z,ref:A,children:[l.jsx("button",{ref:L,id:C,type:"button",className:"menu-trigger","aria-haspopup":"menu","aria-expanded":i,"aria-controls":w,"aria-label":z,onClick:J,onKeyDown:Q,children:m}),i&&l.jsx("div",{id:w,role:"menu","aria-labelledby":C,className:"menu-panel",onKeyDown:X,children:a.map((e,r)=>l.jsxs("button",{ref:n=>{c.current[r]=n},type:"button",role:"menuitem",className:["menu-item",e.disabled?"menu-item-disabled":""].filter(Boolean).join(" "),disabled:e.disabled,tabIndex:g===r?0:-1,onClick:()=>Y(e),children:[e.icon&&l.jsx("span",{className:"menu-item-icon","aria-hidden":"true",children:e.icon}),l.jsx("span",{className:"menu-item-label",children:e.label})]},e.id))})]})}try{E.displayName="Menu",E.__docgenInfo={description:`Menu — disclosure menu (hamburger / actions).

Trigger button toggles a role="menu" panel containing role="menuitem" entries.
Closes on Escape, click outside, and after item selection. Keyboard support:
Enter/Space activate, Escape close, ArrowDown/ArrowUp move focus.`,displayName:"Menu",props:{trigger:{defaultValue:null,description:"Trigger content (rendered inside a <button> with aria-haspopup)",name:"trigger",required:!0,type:{name:"ReactNode"}},items:{defaultValue:null,description:"Menu items",name:"items",required:!0,type:{name:"MenuItem[]"}},align:{defaultValue:{value:"start"},description:"Panel alignment relative to the trigger",name:"align",required:!1,type:{name:"enum",value:[{value:'"start"'},{value:'"end"'}]}},triggerLabel:{defaultValue:null,description:"Accessible label for the trigger button — required when trigger is icon-only",name:"triggerLabel",required:!1,type:{name:"string"}},className:{defaultValue:{value:""},description:"Additional CSS class names",name:"className",required:!1,type:{name:"string"}}}}}catch{}const te={title:"Navigation/Menu",component:E,parameters:{layout:"padded",docs:{description:{component:'Disclosure menu with role="menu" panel. Closes on Escape, outside click, and item selection.'}}},tags:["autodocs"]},d=[{id:"edit",label:"Modifier",onSelect:()=>{console.log("Modifier")}},{id:"duplicate",label:"Dupliquer",onSelect:()=>{console.log("Dupliquer")}},{id:"archive",label:"Archiver",onSelect:()=>{console.log("Archiver")}},{id:"delete",label:"Supprimer",onSelect:()=>{console.log("Supprimer")}}],h={args:{trigger:"Actions",items:d,triggerLabel:"Ouvrir le menu des actions"}},k={args:{trigger:"Options",items:d,align:"end",triggerLabel:"Ouvrir le menu des options"}},v={args:{trigger:"Actions",triggerLabel:"Ouvrir le menu des actions",items:[...d.slice(0,2),{id:"export",label:"Exporter (verrouillé)",disabled:!0,onSelect:()=>{}},...d.slice(2)]}},y={args:{trigger:"☰",triggerLabel:"Ouvrir le menu principal",items:[{id:"home",label:"Accueil",onSelect:()=>{}},{id:"candidates",label:"Candidats",onSelect:()=>{}},{id:"settings",label:"Paramètres",onSelect:()=>{}}]}},x={args:{trigger:"Actions",items:d,triggerLabel:"Ouvrir le menu des actions"},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[m=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),l.jsx(m,{}))]};var M,N,j;h.parameters={...h.parameters,docs:{...(M=h.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    trigger: 'Actions',
    items: baseItems,
    triggerLabel: 'Ouvrir le menu des actions'
  }
}`,...(j=(N=h.parameters)==null?void 0:N.docs)==null?void 0:j.source}}};var q,_,R;k.parameters={...k.parameters,docs:{...(q=k.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    trigger: 'Options',
    items: baseItems,
    align: 'end',
    triggerLabel: 'Ouvrir le menu des options'
  }
}`,...(R=(_=k.parameters)==null?void 0:_.docs)==null?void 0:R.source}}};var T,K,V;v.parameters={...v.parameters,docs:{...(T=v.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    trigger: 'Actions',
    triggerLabel: 'Ouvrir le menu des actions',
    items: [...baseItems.slice(0, 2), {
      id: 'export',
      label: 'Exporter (verrouillé)',
      disabled: true,
      onSelect: () => {
        // noop
      }
    }, ...baseItems.slice(2)]
  }
}`,...(V=(K=v.parameters)==null?void 0:K.docs)==null?void 0:V.source}}};var F,P,H;y.parameters={...y.parameters,docs:{...(F=y.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    trigger: '☰',
    triggerLabel: 'Ouvrir le menu principal',
    items: [{
      id: 'home',
      label: 'Accueil',
      onSelect: () => {
        // noop
      }
    }, {
      id: 'candidates',
      label: 'Candidats',
      onSelect: () => {
        // noop
      }
    }, {
      id: 'settings',
      label: 'Paramètres',
      onSelect: () => {
        // noop
      }
    }]
  }
}`,...(H=(P=y.parameters)==null?void 0:P.docs)==null?void 0:H.source}}};var U,$,B;x.parameters={...x.parameters,docs:{...(U=x.parameters)==null?void 0:U.docs,source:{originalSource:`{
  args: {
    trigger: 'Actions',
    items: baseItems,
    triggerLabel: 'Ouvrir le menu des actions'
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
}`,...(B=($=x.parameters)==null?void 0:$.docs)==null?void 0:B.source}}};const ae=["Default","AlignedEnd","WithDisabledItem","HamburgerTrigger","DarkMode"];export{k as AlignedEnd,x as DarkMode,h as Default,y as HamburgerTrigger,v as WithDisabledItem,ae as __namedExportsOrder,te as default};
