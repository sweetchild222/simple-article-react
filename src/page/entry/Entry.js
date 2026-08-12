import React from 'react'
import ReactDOM from 'react-dom/client'
import './Entry.css'
import {BrowserRouter, createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'


import BlogHeader from '@page/blog/Header.js'
import BlogHome  from '@page/blog/Home.js'
import Article  from '@page/blog/article/Article.js'

import SideBar from '@page/main/SideBar.js'
import AppBar from '@page/main/AppBar.js'
import MainHome from '@page/main/Home.js'

import Configuration from '@page/user/Configuration.js'
import User from '@page/user/User.js'
import Regist from '@page/user/Regist.js'
import Login from '@page/user/Login.js'

import Writer from '@page/editor/Writer.js'
import Posting from '@page/editor/Posting.js'
import ErrorCatch from './ErrorCatch.js'
import NotFound from '@page/common/NotFound.js'

import AuthProvider from '@util/AuthProvider.js'
import DeviceType from '@util/DeviceType.js'
import ToastContainer from '@gui/ToastContainer.js'

import {Vertical, Horizental} from "@gui/Flex.js";
import {VPad, HPad} from "@gui/Pad.js";


const Aplication = function() {

  const DeskRootLayout = () => (
    
    <Horizental style={{width:'100%', height:'100%'}}>
      <SideBar/>
      <Outlet/>
    </Horizental>
  )


  const MobileRootLayout = () => (
    
    <Vertical style={{width:'100%', height:'100%'}}>
      <AppBar/>
      <Outlet/>
    </Vertical>
  )



  const BlogLayout = () => (
    
    <Vertical style={{width:'100%', height:'100%'}}>
      <BlogHeader/>
      <VPad size={16}/>      
      <Outlet/>
      <VPad size={32}/>      
    </Vertical>
  )


  const router = createBrowserRouter([
    {
      path: "/",
      element: (DeviceType() == 'mobile' ? <MobileRootLayout/> : <DeskRootLayout />),
      children: [
        { index: true, element: <MainHome/>},
        { path: 'account', children: [
          { index: true, element: <Login/>},
          { path: 'regist', element: <Regist/>}]
        },
        { path: 'user/:id', children: [
          { index: true, element: <User/>},
          { path: 'configuration', element: <Configuration/>}]
        },
        { path: 'notFound', element: <NotFound/>}
      ],
      errorElement: <NotFound />
    },
    {
      path: "/blog/:b_id",
      element: <BlogLayout />,
      children: [
        { index: true, element: <BlogHome/>},
        { path: 'article/:a_id', children: [
          { index: true, element: <Article/>}        
        ]},
        { path: 'write', children: [
          { index: true, element: <Writer/>},
          { path: 'posting', element: <Posting/>}
        ]}
      ]
    }
  ])

  return (
      <RouterProvider router={router}/>
  )
}


const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
//<React.StrictMode>
<ErrorCatch>
  <AuthProvider>
    <ToastContainer />
      <Aplication />
  </AuthProvider>
</ErrorCatch>
  
//</React.StrictMode>
)







