from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Message, User
from app.schemas import MessageCreate, MessageOut, ThreadOut

router = APIRouter(prefix="/api/messages", tags=["messages"])


def to_message_out(message: Message) -> MessageOut:
    return MessageOut(
        id=message.id,
        sender_id=message.sender_id,
        sender_name=message.sender.name,
        recipient_id=message.recipient_id,
        recipient_name=message.recipient.name,
        listing_id=message.listing_id,
        listing_title=message.listing.title if message.listing else None,
        body=message.body,
        read=message.read,
        created_at=message.created_at,
    )


@router.post("", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def send_message(
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.recipient_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot message yourself")
    if db.get(User, payload.recipient_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipient not found")

    message = Message(
        sender_id=current_user.id,
        recipient_id=payload.recipient_id,
        listing_id=payload.listing_id,
        body=payload.body,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return to_message_out(message)


@router.get("/threads", response_model=list[ThreadOut])
def list_threads(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    messages = (
        db.query(Message)
        .filter(or_(Message.sender_id == current_user.id, Message.recipient_id == current_user.id))
        .order_by(Message.created_at.desc())
        .all()
    )

    threads: dict[int, ThreadOut] = {}
    unread_counts: dict[int, int] = {}
    for m in messages:
        other_id = m.recipient_id if m.sender_id == current_user.id else m.sender_id
        other_name = m.recipient.name if m.sender_id == current_user.id else m.sender.name
        if m.recipient_id == current_user.id and not m.read:
            unread_counts[other_id] = unread_counts.get(other_id, 0) + 1
        if other_id not in threads:
            threads[other_id] = ThreadOut(
                other_user_id=other_id,
                other_user_name=other_name,
                last_message=m.body,
                last_message_at=m.created_at,
                unread_count=0,
            )

    for thread in threads.values():
        thread.unread_count = unread_counts.get(thread.other_user_id, 0)

    return sorted(threads.values(), key=lambda t: t.last_message_at, reverse=True)


@router.get("/thread/{other_user_id}", response_model=list[MessageOut])
def get_thread(
    other_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    messages = (
        db.query(Message)
        .filter(
            or_(
                and_(Message.sender_id == current_user.id, Message.recipient_id == other_user_id),
                and_(Message.sender_id == other_user_id, Message.recipient_id == current_user.id),
            )
        )
        .order_by(Message.created_at.asc())
        .all()
    )

    unread_ids = [m.id for m in messages if m.recipient_id == current_user.id and not m.read]
    if unread_ids:
        db.query(Message).filter(Message.id.in_(unread_ids)).update({"read": True}, synchronize_session=False)
        db.commit()
        for m in messages:
            if m.id in unread_ids:
                m.read = True

    return [to_message_out(m) for m in messages]
