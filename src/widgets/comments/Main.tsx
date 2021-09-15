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
    children: string[], // these are ids of other comments
}

type CommentsDictionary = {
    [key:string]: Comment
}

const Main = () => {

    const [typedComment, set_typedComment] = useState('');

    const [list, set_list] = useState<Comment[]>([]);
    // dictionary
    const [commentsDictionary, set_commentsDictionary] = useState<CommentsDictionary>({});

    const editComment = (_id: string,action:'delete'|'reply'|'share', newComment?:Comment) => {
        // get comment
        const gotComment = {...commentsDictionary[_id]};
        console.log({gotComment,_id});
        switch(action){
            case 'reply': 
                if(newComment){
                    gotComment.children.push(newComment._id); // set heirarchey
                    set_commentsDictionary({ 
                        ...commentsDictionary,
                        [newComment._id]:newComment // add to dictionary
                    })
                }
        }
    }

    const x = {
        typedComment,
        set_typedComment,
        commentsDictionary,
        set_commentsDictionary,
        list,
        set_list,
        editComment
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
                }} 
            />
                
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
        editComment: (_id: string, action: 'delete' | 'reply' | 'share', newComment?: Comment | undefined) => void
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
                    if(x.typedComment.length === 0) return;

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
                        [_id]: newComment
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
                        <CommentLine key={i} comment={comment} x={x} />
                    )
                })
            }
        </div>
    )
}


// comment_line
interface CommentLineProps extends RootExtension{
    comment:Comment
}
const CommentLine = ({comment, x}:CommentLineProps) => {

    const [collapse, set_collapse] = useState(false);

    const x2 = {
        collapse,set_collapse,
    }

    // when user tries to reply to someone, capture the input here
    const [replied, set_replied] = useState('');


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
                <CollapsibleController comment={comment} x2={x2} />
            </div>

            {/* collapsible-input-area */}
            <div className='collapsible-input-area' style={{gridArea:'collapsible-main', display: collapse?'none':'grid' }}>
                <div className='input_box grid' >
                    <input placeholder='replying...' onChange={(e)=>{
                            set_replied(e.currentTarget.value)
                        }}
                        value={replied}

                        onBlur={()=>{
                            if(replied.length === 0) return;
                            const _id = uuidv4();
                            const newComment: Comment = {
                                _id,
                                owner: 'random owner',
                                createdAt: Date.now(),
                                text: replied,
                                children: []
                            }
                            // add to self list, not main list
                            x.editComment(comment._id, 'reply', newComment);

                            // add to dictionary
                            x.set_commentsDictionary({
                                ...x.commentsDictionary,
                                [_id]: newComment
                            })
                            set_replied('');
                        }}
                    />
                </div>
            </div>

            {/* children-comments */}
            <ChildrenCommentSection _ids={comment.children} x={x} />
        </div>
)}

// children-comments
interface ChildrenCommentSectionProps extends RootExtension {
    _ids:string[]
}

const ChildrenCommentSection = (p:ChildrenCommentSectionProps) => {

    const comments = () =>{
        return p._ids.map((_id,i)=>{
            return(
                p.x.commentsDictionary[_id]
            )
        })
    }

    return(
        <div className='children-comments' style={{gridArea:'children-comments'}} >
            {
                comments().map((comment,i)=>{
                    return(
                        <div key={i}>
                            <CommentLine comment={comment} x={p.x} />
                            {/* {comment.text} */}
                        </div>
                    )
                })
            }
        </div>
    )
}

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

interface CollapsibleControllerProps {
    x2:{
        collapse:boolean,
        set_collapse: setAnything<boolean>,
    },
    comment:Comment
}

const CollapsibleController = ({comment,x2}:CollapsibleControllerProps) => {
    return(
        <div className='collapsible-controller' >
            <div  className='iconWrapper controller-item'>
                <FaAngleDown style={{fontSize:'inherit',color:'inherit'}} />
            </div>

            <div  style={{border:'1px solid grey'}} />

            <div  className='iconWrapper controller-item'>
                <FaAngleUp style={{fontSize:'inherit',color:'inherit'}} />
            </div>


            <div className='controller-item' onClick={() => {
                x2.set_collapse(false)
            }}>
                Reply
            </div>
            <div className='controller-item'>
                Share
            </div>

            {/* large gapping purpose */}
            <div/>
        </div>
    )
}