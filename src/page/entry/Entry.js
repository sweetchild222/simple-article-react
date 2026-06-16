import React from 'react'
import ReactDOM from 'react-dom/client'
import './Entry.css'
import {BrowserRouter, createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'


import BlogHeader from '@page/blog/Header.js'
import BlogHome  from '@page/blog/Home.js'
import Article  from '@page/blog/article/Article.js'
import MainHeader from '@page/main/Header.js'
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
import ToastContainer from '@gui/ToastContainer.js'

import {Horizental, Vertical} from "@gui/Flex.js";


const Aplication = function() {

  const RootLayout = () => (

    <Horizental style={{width:'100%', height:'100%'}}>
      <MainHeader/>
      <div style={{height:'30px', maxHeight:'30px', minHeight:'30px'}}/>
      <Outlet/>
    </Horizental>
  )


  const BlogLayout = () => (
    
    <Horizental style={{width:'100%', height:'100%'}}>
      <BlogHeader/>
      <div style={{height:'30px', maxHeight:'30px', minHeight:'30px'}}/>
      <Outlet/>
    </Horizental>
  )


  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
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
);
