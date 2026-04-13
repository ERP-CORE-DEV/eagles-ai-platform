import{j as t}from"./jsx-runtime-Z5uAzocK.js";import{r as l}from"./index-pP6CS22B.js";import{B as o}from"./Button-BDYnqn9u.js";import"./_commonjsHelpers-Cpj98o6Y.js";function r({content:e,children:p,placement:E="top"}){const d=l.useId(),w=l.isValidElement(p)?l.cloneElement(p,{"aria-describedby":d}):p;return t.jsxs("span",{className:"tooltip-wrapper",children:[w,t.jsx("span",{id:d,role:"tooltip",className:`tooltip tooltip-${E}`,children:e})]})}try{r.displayName="Tooltip",r.__docgenInfo={description:`Tooltip — hover/focus tooltip.

Shows on :hover and :focus-within of a wrapper using pure CSS, so no
stateful JavaScript is required. Wires aria-describedby on the trigger
via useId so the tooltip text is announced by assistive tech.`,displayName:"Tooltip",props:{content:{defaultValue:null,description:"Tooltip text content",name:"content",required:!0,type:{name:"string"}},children:{defaultValue:null,description:"Trigger element — must be a single React element that accepts aria-describedby",name:"children",required:!0,type:{name:"ReactNode"}},placement:{defaultValue:{value:"top"},description:"Placement relative to the trigger — defaults to 'top'",name:"placement",required:!1,type:{name:"enum",value:[{value:'"top"'},{value:'"right"'},{value:'"bottom"'},{value:'"left"'}]}}}}}catch{}const R={title:"Feedback/Tooltip",component:r,parameters:{layout:"centered",docs:{description:{component:"Hover/focus tooltip that appears via pure CSS. Wires aria-describedby on the trigger so screen readers announce the content."}}},tags:["autodocs"],argTypes:{placement:{control:"select",options:["top","right","bottom","left"]}}},n={args:{content:"Save and publish",placement:"top"},render:e=>t.jsx(r,{...e,children:t.jsx(o,{children:"Publish"})})},a={args:{content:"Opens in a new tab",placement:"right"},render:e=>t.jsx(r,{...e,children:t.jsx(o,{variant:"secondary",children:"Open"})})},s={args:{content:"This action is irreversible",placement:"bottom"},render:e=>t.jsx(r,{...e,children:t.jsx(o,{variant:"danger",children:"Delete"})})},i={args:{content:"Move to next stage",placement:"left"},render:e=>t.jsx(r,{...e,children:t.jsx(o,{variant:"success",children:"Approve"})})},c={args:{content:"Save and publish",placement:"top"},render:e=>t.jsx(r,{...e,children:t.jsx(o,{children:"Publish"})}),parameters:{backgrounds:{default:"dark"},theme:"dark"},decorators:[e=>(typeof document<"u"&&document.documentElement.setAttribute("data-theme","dark"),t.jsx(e,{}))]};var u,m,g;n.parameters={...n.parameters,docs:{...(u=n.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    content: 'Save and publish',
    placement: 'top'
  },
  render: args => <Tooltip {...args}>\r
      <Button>Publish</Button>\r
    </Tooltip>
}`,...(g=(m=n.parameters)==null?void 0:m.docs)==null?void 0:g.source}}};var h,f,b;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    content: 'Opens in a new tab',
    placement: 'right'
  },
  render: args => <Tooltip {...args}>\r
      <Button variant="secondary">Open</Button>\r
    </Tooltip>
}`,...(b=(f=a.parameters)==null?void 0:f.docs)==null?void 0:b.source}}};var v,x,y;s.parameters={...s.parameters,docs:{...(v=s.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    content: 'This action is irreversible',
    placement: 'bottom'
  },
  render: args => <Tooltip {...args}>\r
      <Button variant="danger">Delete</Button>\r
    </Tooltip>
}`,...(y=(x=s.parameters)==null?void 0:x.docs)==null?void 0:y.source}}};var T,S,j;i.parameters={...i.parameters,docs:{...(T=i.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    content: 'Move to next stage',
    placement: 'left'
  },
  render: args => <Tooltip {...args}>\r
      <Button variant="success">Approve</Button>\r
    </Tooltip>
}`,...(j=(S=i.parameters)==null?void 0:S.docs)==null?void 0:j.source}}};var B,k,_;c.parameters={...c.parameters,docs:{...(B=c.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    content: 'Save and publish',
    placement: 'top'
  },
  render: args => <Tooltip {...args}>\r
      <Button>Publish</Button>\r
    </Tooltip>,
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
}`,...(_=(k=c.parameters)==null?void 0:k.docs)==null?void 0:_.source}}};const q=["Default","Right","Bottom","Left","DarkMode"];export{s as Bottom,c as DarkMode,n as Default,i as Left,a as Right,q as __namedExportsOrder,R as default};
