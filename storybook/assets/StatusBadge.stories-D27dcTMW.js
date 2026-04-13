import{j as p}from"./jsx-runtime-Z5uAzocK.js";import{S as T}from"./StatusBadge-BlA6NUP9.js";import"./index-pP6CS22B.js";import"./_commonjsHelpers-Cpj98o6Y.js";const H={title:"UI/StatusBadge",component:T,tags:["autodocs"],argTypes:{status:{control:"select",options:["Draft","PendingReview","Approved","Rejected","Published","Active","Paused","Completed","Closed","Archived","Open","Expired","Scheduled","Cancelled","InProgress"]},size:{control:"select",options:["small","default"]},showDot:{control:"boolean"}}},s={args:{status:"Active"}},r={args:{status:"Draft"}},a={args:{status:"PendingReview"}},t={args:{status:"Approved"}},o={args:{status:"Rejected"}},n={args:{status:"Paused"}},d={args:{status:"Active",size:"small"}},c={render:()=>p.jsx("div",{className:"stories-row",children:["Draft","PendingReview","Approved","Rejected","Published","Active","Paused","Completed","Open","Expired","Scheduled","Cancelled","InProgress"].map(e=>p.jsx(T,{status:e},e))})},u={args:{status:"Active"},parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[e=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),p.jsx(e,{}))]};var m,i,l;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    status: 'Active'
  }
}`,...(l=(i=s.parameters)==null?void 0:i.docs)==null?void 0:l.source}}};var g,v,S;r.parameters={...r.parameters,docs:{...(g=r.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    status: 'Draft'
  }
}`,...(S=(v=r.parameters)==null?void 0:v.docs)==null?void 0:S.source}}};var f,A,P;a.parameters={...a.parameters,docs:{...(f=a.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    status: 'PendingReview'
  }
}`,...(P=(A=a.parameters)==null?void 0:A.docs)==null?void 0:P.source}}};var R,h,j;t.parameters={...t.parameters,docs:{...(R=t.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    status: 'Approved'
  }
}`,...(j=(h=t.parameters)==null?void 0:h.docs)==null?void 0:j.source}}};var D,k,w;o.parameters={...o.parameters,docs:{...(D=o.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    status: 'Rejected'
  }
}`,...(w=(k=o.parameters)==null?void 0:k.docs)==null?void 0:w.source}}};var x,b,C;n.parameters={...n.parameters,docs:{...(x=n.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    status: 'Paused'
  }
}`,...(C=(b=n.parameters)==null?void 0:b.docs)==null?void 0:C.source}}};var E,y,I;d.parameters={...d.parameters,docs:{...(E=d.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    status: 'Active',
    size: 'small'
  }
}`,...(I=(y=d.parameters)==null?void 0:y.docs)==null?void 0:I.source}}};var O,z,B;c.parameters={...c.parameters,docs:{...(O=c.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => <div className="stories-row">\r
      {['Draft', 'PendingReview', 'Approved', 'Rejected', 'Published', 'Active', 'Paused', 'Completed', 'Open', 'Expired', 'Scheduled', 'Cancelled', 'InProgress'].map(s => <StatusBadge key={s} status={s} />)}\r
    </div>
}`,...(B=(z=c.parameters)==null?void 0:z.docs)==null?void 0:B.source}}};var M,N,_;u.parameters={...u.parameters,docs:{...(M=u.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    status: 'Active'
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
}`,...(_=(N=u.parameters)==null?void 0:N.docs)==null?void 0:_.source}}};const J=["Default","Draft","PendingReview","Approved","Rejected","Paused","Small","AllStatuses","DarkMode"];export{c as AllStatuses,t as Approved,u as DarkMode,s as Default,r as Draft,n as Paused,a as PendingReview,o as Rejected,d as Small,J as __namedExportsOrder,H as default};
