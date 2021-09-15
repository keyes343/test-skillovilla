import React, { useState, useEffect, useContext, useCallback, useRef, useMemo } from 'react';
import './style.css';
import './comment_list.css';
import {BsFillPersonFill} from 'react-icons/bs';
import {FaAngleUp, FaAngleDown} from 'react-icons/fa'
import { v4 as uuidv4 } from 'uuid';

type Comment = {
    _id: string,
    owner:string;
    createdAt:number;
    text:string,
    children: Comment[]
}

type CommentsDictionary = {
    [key:string]: Comment
}

const Main = () => {

    const [typedComment, set_typedComment] = useState('');

    const [list, set_list] = useState<Comment[]>([]);
    // dictionary
    const [commentsDictionary, set_commentsDictionary] = useState<CommentsDictionary>({});

    const x = {
        typedComment,
        set_typedComment,
        commentsDictionary,
        set_commentsDictionary,
        list,
        set_list
    }

    return(
        <div className='top' >
            {/* console purpose */}
            <div
             
             style={{height:'5rem', border:'2px solid red', width:'100%'}}
             onClick={()=>{
                console.log({
                    list,commentsDictionary,typedComment
                })
            }} />
            <div className='header' style={{border:'2px solid green'}}>
                <CommentsInput  x={x} />
                <ViewComments x={x} />
            </div>
        </div>
)}

export default Main;


type setAnything<T> = React.Dispatch<React.SetStateAction<T>>

interface RootExtension {
    x:{
        typedComment: string,
        set_typedComment: setAnything<string>,
        commentsDictionary: CommentsDictionary,
        set_commentsDictionary: setAnything<CommentsDictionary>,
        list: Comment[],
        set_list: setAnything<Comment[]>,
    }
}

// input_section
const CommentsInput = ({x}:RootExtension) => {
    return(
        <div className='grid input_section  '>
            <div className='grid pic' >
                <BsFillPersonFill style={{fontSize:'inherit', color:'inherit', opacity:0.5}} />
            </div>
            <div className='grid input_box' >
                <input className='input_itself' value={x.typedComment} 
                onChange={(e) => x.set_typedComment(e.currentTarget.value)} 
                onBlur={()=>{
                    const _id = uuidv4();
                    const newComment: Comment = {
                        _id,
                        owner: 'random owner',
                        createdAt: Date.now(),
                        text: x.typedComment,
                        children: []
                    }
                    // add to list
                    x.set_list([...x.list, newComment])

                    // add to dictionary
                    x.set_commentsDictionary({
                        ...x.commentsDictionary,
                        _id: newComment
                    })
                    x.set_typedComment('')
                }}
                placeholder='Join the discussion...' />
            </div>
        </div>
)}

// list of comments
const ViewComments = ({x}:RootExtension) => {
    // const arr = Object.values(x.list);
    return(
        <div className='comment_section'>
            {
                x.list.map((comment,i)=>{
                    return(
                        <CommentLine comment={comment} />
                    )
                })
            }
        </div>
    )
}


// comment_line

const CommentLine = ({comment}:{comment: Comment}) => {
    return(
        <div className='listItem'>
            {/* pic */}
            <div style={{gridArea:'pic'}} className='pic-box'>
                <BsFillPersonFill style={{fontSize:'inherit', color:'inherit', opacity:0.5}} />
            </div>

            {/* title-area */}
            <TitleRow comment={comment} /> 

            {/* comment-body */}
            <div style={{gridArea:'body'}} className='body-area' >
                {comment.text}
            </div>

            {/* collapsible-reply-share options */}
            <div style={{gridArea:'collapsible-controller'}} className='body-area' >
                <CollapsibleController comment={comment} />
            </div>
        </div>
)}

const TitleRow = ({comment}:{comment:Comment}) => {
    return(
        <div className='title-row'>
            <div className='title-item'>
                owner = {comment.owner}
            </div>
            <div style={{
                color:'grey'
            }} >
                7hrs
            </div>

            {/* large gapping purpose */}
            <div/>
        </div>
)}

const CollapsibleController = ({comment}:{comment: Comment}) => {
    return(
        <div className='collapsible-controller' >
            <div className='iconWrapper'>
                <FaAngleDown style={{fontSize:'inherit',color:'inherit'}} />
            </div>

            <div style={{border:'1px solid grey'}} />
            
            <div className='iconWrapper'>
                <FaAngleUp style={{fontSize:'inherit',color:'inherit'}} />
            </div>


            <div>
                reply
            </div>
            <div>
                share
            </div>

            {/* large gapping purpose */}
            <div/>
        </div>
    )
}