import{j as r}from"./jsx-runtime-Z5uAzocK.js";import{fn as J}from"./index-DgAF9SIF.js";import{B as e}from"./Button-BDYnqn9u.js";import"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";const $={title:"UI/Button",component:e,tags:["autodocs"],argTypes:{variant:{control:"select",options:["primary","secondary","success","danger","warning","info"]},size:{control:"select",options:["small","medium","large"]},loading:{control:"boolean"},disabled:{control:"boolean"}},args:{onClick:J(),children:"Bouton"}},a={args:{variant:"primary",children:"Ajouter un candidat"}},n={args:{variant:"secondary",children:"Annuler"}},s={args:{variant:"success",children:"Valider le CDI"}},t={args:{variant:"danger",children:"Supprimer"}},o={args:{variant:"warning",children:"Attention CDD"}},i={args:{variant:"info",children:"Voir le profil"}},c={args:{variant:"primary",loading:!0,children:"Enregistrement..."}},d={args:{variant:"primary",disabled:!0,children:"Indisponible"}},u={render:()=>r.jsxs("div",{className:"stories-row",children:[r.jsx(e,{size:"small",children:"Petit"}),r.jsx(e,{size:"medium",children:"Moyen"}),r.jsx(e,{size:"large",children:"Grand"})]})},m={render:()=>r.jsxs("div",{className:"stories-row",children:[r.jsx(e,{variant:"primary",children:"Primary"}),r.jsx(e,{variant:"secondary",children:"Secondary"}),r.jsx(e,{variant:"success",children:"Success"}),r.jsx(e,{variant:"danger",children:"Danger"}),r.jsx(e,{variant:"warning",children:"Warning"}),r.jsx(e,{variant:"info",children:"Info"})]})},l={args:{variant:"primary",children:"Ajouter un candidat"},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[H=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),r.jsx(H,{}))]};var p,g,v;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    variant: 'primary',
    children: 'Ajouter un candidat'
  }
}`,...(v=(g=a.parameters)==null?void 0:g.docs)==null?void 0:v.source}}};var h,y,f;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    variant: 'secondary',
    children: 'Annuler'
  }
}`,...(f=(y=n.parameters)==null?void 0:y.docs)==null?void 0:f.source}}};var S,B,j;s.parameters={...s.parameters,docs:{...(S=s.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    variant: 'success',
    children: 'Valider le CDI'
  }
}`,...(j=(B=s.parameters)==null?void 0:B.docs)==null?void 0:j.source}}};var x,D,b;t.parameters={...t.parameters,docs:{...(x=t.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    variant: 'danger',
    children: 'Supprimer'
  }
}`,...(b=(D=t.parameters)==null?void 0:D.docs)==null?void 0:b.source}}};var A,k,w;o.parameters={...o.parameters,docs:{...(A=o.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    variant: 'warning',
    children: 'Attention CDD'
  }
}`,...(w=(k=o.parameters)==null?void 0:k.docs)==null?void 0:w.source}}};var z,I,E;i.parameters={...i.parameters,docs:{...(z=i.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    variant: 'info',
    children: 'Voir le profil'
  }
}`,...(E=(I=i.parameters)==null?void 0:I.docs)==null?void 0:E.source}}};var V,C,M;c.parameters={...c.parameters,docs:{...(V=c.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    variant: 'primary',
    loading: true,
    children: 'Enregistrement...'
  }
}`,...(M=(C=c.parameters)==null?void 0:C.docs)==null?void 0:M.source}}};var N,P,W;d.parameters={...d.parameters,docs:{...(N=d.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Indisponible'
  }
}`,...(W=(P=d.parameters)==null?void 0:P.docs)==null?void 0:W.source}}};var G,L,_;u.parameters={...u.parameters,docs:{...(G=u.parameters)==null?void 0:G.docs,source:{originalSource:`{
  render: () => <div className="stories-row">\r
      <Button size="small">Petit</Button>\r
      <Button size="medium">Moyen</Button>\r
      <Button size="large">Grand</Button>\r
    </div>
}`,...(_=(L=u.parameters)==null?void 0:L.docs)==null?void 0:_.source}}};var O,R,T;m.parameters={...m.parameters,docs:{...(O=m.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => <div className="stories-row">\r
      <Button variant="primary">Primary</Button>\r
      <Button variant="secondary">Secondary</Button>\r
      <Button variant="success">Success</Button>\r
      <Button variant="danger">Danger</Button>\r
      <Button variant="warning">Warning</Button>\r
      <Button variant="info">Info</Button>\r
    </div>
}`,...(T=(R=m.parameters)==null?void 0:R.docs)==null?void 0:T.source}}};var U,q,F;l.parameters={...l.parameters,docs:{...(U=l.parameters)==null?void 0:U.docs,source:{originalSource:`{
  args: {
    variant: 'primary',
    children: 'Ajouter un candidat'
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
}`,...(F=(q=l.parameters)==null?void 0:q.docs)==null?void 0:F.source}}};const rr=["Default","Secondary","Success","Danger","Warning","Info","Loading","Disabled","Sizes","AllVariants","DarkMode"];export{m as AllVariants,t as Danger,l as DarkMode,a as Default,d as Disabled,i as Info,c as Loading,n as Secondary,u as Sizes,s as Success,o as Warning,rr as __namedExportsOrder,$ as default};
