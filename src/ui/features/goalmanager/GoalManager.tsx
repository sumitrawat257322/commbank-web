import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons'
import { faDollarSign, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date'
import 'date-fns'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Picker } from 'emoji-mart'
import { updateGoal as updateGoalApi } from '../../../api/lib'
import { Goal } from '../../../api/types'
import {
  selectGoalsMap,
  updateGoal as updateGoalRedux,
} from '../../../store/goalsSlice'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import DatePicker from '../../components/DatePicker'
import { Theme } from '../../components/Theme'

type Props = { goal: Goal }

export function GoalManager(props: Props) {
  const dispatch = useAppDispatch()

  const goal = useAppSelector(selectGoalsMap)[props.goal.id]

  const [name, setName] = useState<string | null>(null)
  const [targetDate, setTargetDate] = useState<Date | null>(null)
  const [targetAmount, setTargetAmount] = useState<number | null>(null)
  const [icon, setIcon] = useState<string | null>(null)
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)

  useEffect(() => {
    setName(props.goal.name)
    setTargetDate(props.goal.targetDate)
    setTargetAmount(props.goal.targetAmount)
    setIcon(props.goal.icon)
  }, [
    props.goal.id,
    props.goal.name,
    props.goal.targetDate,
    props.goal.targetAmount,
    props.goal.icon,
  ])

  useEffect(() => {
    setName(goal.name)
    setIcon(goal.icon)
  }, [goal.name, goal.icon])

  const updateNameOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextName = event.target.value
    setName(nextName)

    const updatedGoal: Goal = {
      ...props.goal,
      name: nextName,
    }

    dispatch(updateGoalRedux(updatedGoal))
    updateGoalApi(props.goal.id, updatedGoal)
  }

  const updateTargetAmountOnChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nextTargetAmount = parseFloat(event.target.value)
    setTargetAmount(nextTargetAmount)

    const updatedGoal: Goal = {
      ...props.goal,
      name: name ?? props.goal.name,
      targetDate: targetDate ?? props.goal.targetDate,
      targetAmount: nextTargetAmount,
      icon: icon ?? props.goal.icon,
    }

    dispatch(updateGoalRedux(updatedGoal))
    updateGoalApi(props.goal.id, updatedGoal)
  }

  const pickDateOnChange = (date: MaterialUiPickersDate) => {
    if (date != null) {
      setTargetDate(date)

      const updatedGoal: Goal = {
        ...props.goal,
        name: name ?? props.goal.name,
        targetDate: date,
        targetAmount: targetAmount ?? props.goal.targetAmount,
        icon: icon ?? props.goal.icon,
      }

      dispatch(updateGoalRedux(updatedGoal))
      updateGoalApi(props.goal.id, updatedGoal)
    }
  }

  const pickEmojiOnClick = (emoji: any) => {
    const nextIcon = emoji.native

    setIcon(nextIcon)
    setIsEmojiPickerOpen(false)

    const updatedGoal: Goal = {
      ...props.goal,
      icon: emoji.native ?? props.goal.icon,
      name: name ?? props.goal.name,
      targetDate: targetDate ?? props.goal.targetDate,
      targetAmount: targetAmount ?? props.goal.targetAmount,
    }

    dispatch(updateGoalRedux(updatedGoal))
    updateGoalApi(props.goal.id, updatedGoal)
  }

  return (
    <GoalManagerContainer>
      <NameInput value={name ?? ''} onChange={updateNameOnChange} />

      <GoalIconContainer>
        {icon ? (
          <GoalIcon onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}>
            {icon}
          </GoalIcon>
        ) : (
          <AddIconButton
            onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
          >
            Add Icon
          </AddIconButton>
        )}

        {isEmojiPickerOpen && (
          <EmojiPickerContainer>
            <Picker onSelect={pickEmojiOnClick} />
          </EmojiPickerContainer>
        )}
      </GoalIconContainer>

      <Group>
        <Field name="Target Date" icon={faCalendarAlt} />
        <Value>
          <DatePicker value={targetDate} onChange={pickDateOnChange} />
        </Value>
      </Group>

      <Group>
        <Field name="Target Amount" icon={faDollarSign} />
        <Value>
          <StringInput
            value={targetAmount ?? ''}
            onChange={updateTargetAmountOnChange}
          />
        </Value>
      </Group>

      <Group>
        <Field name="Balance" icon={faDollarSign} />
        <Value>
          <StringValue>{props.goal.balance}</StringValue>
        </Value>
      </Group>

      <Group>
        <Field name="Date Created" icon={faCalendarAlt} />
        <Value>
          <StringValue>
            {new Date(props.goal.created).toLocaleDateString()}
          </StringValue>
        </Value>
      </Group>
    </GoalManagerContainer>
  )
}

type FieldProps = { name: string; icon: IconDefinition }

const Field = (props: FieldProps) => (
  <FieldContainer>
    <FontAwesomeIcon icon={props.icon} size="2x" />
    <FieldName>{props.name}</FieldName>
  </FieldContainer>
)

const GoalManagerContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  height: 100%;
  width: 100%;
  position: relative;
`

const Group = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
`

const NameInput = styled.input`
  display: flex;
  background-color: transparent;
  outline: none;
  border: none;
  font-size: 4rem;
  font-weight: bold;
  color: ${({ theme }: { theme: Theme }) => theme.text};
`

const GoalIconContainer = styled.div`
  position: relative;
  margin-top: 1rem;
  margin-bottom: 1rem;
`

const GoalIcon = styled.div`
  font-size: 3rem;
  cursor: pointer;
`

const AddIconButton = styled.button`
  font-size: 1.2rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
`

const EmojiPickerContainer = styled.div`
  position: absolute;
  z-index: 10;
  top: 3.5rem;
  left: 0;
`

const FieldName = styled.h1`
  font-size: 1.8rem;
  margin-left: 1rem;
  color: rgba(174, 174, 174, 1);
  font-weight: normal;
`

const FieldContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 20rem;

  svg {
    color: rgba(174, 174, 174, 1);
  }
`

const StringValue = styled.h1`
  font-size: 1.8rem;
  font-weight: bold;
`

const StringInput = styled.input`
  display: flex;
  background-color: transparent;
  outline: none;
  border: none;
  font-size: 1.8rem;
  font-weight: bold;
  color: ${({ theme }: { theme: Theme }) => theme.text};
`

const Value = styled.div`
  margin-left: 2rem;
`