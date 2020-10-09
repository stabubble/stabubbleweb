import React, {useState} from 'react';
import {AlertDialog, Button, Card, Icon} from "react-onsenui";
import {SwipeableListItem} from '@sandstreamdev/react-swipeable-list';
import {useHistory} from 'react-router-dom';
import TimeAgo from 'react-timeago';

function PostCard(props) {
    const [isSwiping, setIsSwiping] = useState(false);
    const [swipeProgress, setSwipeProgress] = useState(0);
    const history = useHistory();

    const [displayWarning, setDisplayWarning] = useState(false);

    return (
        <SwipeableListItem
            threshold={0.1}
            swipeLeft={
                props.canVote ?
                    {
                        content: <div>
                            <Icon
                                size={40}
                                icon={'fa-heart-broken'}
                                fixedWidth={true}
                                style={{paddingRight: 20, color: '#aec6cf'}}
                            />
                        </div>,
                        action: () => props.votePostDown(props.id)
                    } : null
            }
            swipeRight={props.canVote ?
                {
                    content: <div>

                        <Icon
                            size={40}
                            icon={'fa-heart'}
                            fixedWidth={true}
                            style={{paddingLeft: 20, color: '#ff6961'}}
                        />
                    </div>,
                    action: () => props.votePostUp(props.id)
                }
                : null
            }
            onSwipeStart={() => {
                setIsSwiping(true);
                setSwipeProgress(0)
            }}
            onSwipeEnd={() => {
                if (swipeProgress === 0) setIsSwiping(false)
            }}
            onSwipeProgress={progress => setSwipeProgress(progress)}
        >
            <Card style={{
                width: '100%', display: 'grid',
                gridTemplateColumns: 'minmax(0px, max-content) minmax(0, 1fr) minmax(0px, max-content)',
                backgroundColor: props.backgroundColor ?? 'white'
            }}>
                <div style={{gridRow: '1/1', justifySelf: 'start'}}>
                    <Icon
                        size={40}
                        icon={'fa-heart'}
                        fixedWidth={true}
                        style={{
                            color: props.voteDirection === 'up' ? '#ff7770' : '#ffc5c2',
                            position: 'relative',
                            textAlign: 'center'
                        }}
                        onClick={() => {
                            if (!isSwiping && !props.canDelete) {
                                props.votePostUp(props.id);
                            }
                        }}>
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: 20,
                            color: props.voteDirection === 'up' ? 'black' : 'gray',
                            fontWeight: 100
                        }}>
                            {[props.upVotes]}
                        </div>
                    </Icon>
                </div>
                <div style={{
                    gridRow: '1/1', overflowWrap: 'break-word', hyphens: 'auto', whiteSpace: 'pre-wrap',
                    paddingLeft: 40, paddingRight: 40, paddingBottom: 40, fontFamily: 'Grandstander'
                }}
                     onClick={() => {
                         if (props.id && !isSwiping && !props.disableClick) {
                             history.push('/post/' + props.id)
                         } else {
                             setIsSwiping(false);
                         }
                     }}>
                    {props.content}
                </div>
                <div style={{gridRow: '1/1', justifySelf: 'end'}}>
                    <Icon
                        size={40}
                        icon={'fa-heart-broken'}
                        fixedWidth={true}
                        style={{
                            color: props.voteDirection === 'down' ? '#a5c3ca' : '#d8e5e8',
                            position: 'relative',
                            textAlign: 'center'
                        }}
                        onClick={() => {
                            if (!isSwiping && !props.canDelete) {
                                props.votePostDown(props.id);
                            }
                        }}>
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: 20,
                            color: props.voteDirection === 'down' ? 'black' : 'gray',
                            fontWeight: 100
                        }}>
                            {props.downVotes}
                        </div>
                    </Icon>
                </div>
                <div style={{
                    position: 'absolute', bottom: 20, color: 'gray',
                    fontSize: props.comment ? 'x-small' : 'small'
                }}>
                    {props.created ? <TimeAgo date={props.created}/> : null}
                    {props.location ? <span> @ {props.location}</span> : null}
                </div>
                {props.canDelete ?
                    <div style={{position: 'absolute', top: 5, right: -10, color: 'gray', fontSize: 'small'}}>
                        <Icon
                            size={15}
                            icon={'fa-trash'}
                            fixedWidth={true}
                            style={{paddingRight: 20}}
                            onClick={() => {
                                setDisplayWarning(true)
                            }}>
                        </Icon>
                    </div>
                    : null}
                {props.commentsLength >= 0 ?
                    <div style={{position: 'absolute', bottom: 20, right: 20, color: 'gray', fontSize: 'small'}}>
                        {props.commentsLength} replies
                    </div> : null}
                <AlertDialog isOpen={displayWarning} onCancel={() => setDisplayWarning(false)} cancelable>
                    <div className="alert-dialog-title">delete?</div>
                    <div className="alert-dialog-content">
                        are you sure?
                    </div>
                    <div className="alert-dialog-footer">
                        <Button onClick={() => props.deletePost(props.id)} className="alert-dialog-button">
                            yes
                        </Button>
                        <Button onClick={() => setDisplayWarning(false)} className="alert-dialog-button">
                            no
                        </Button>
                    </div>
                </AlertDialog>
            </Card>
        </SwipeableListItem>
    )
}

export default PostCard;