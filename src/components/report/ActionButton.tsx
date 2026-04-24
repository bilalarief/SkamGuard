/**
 * Interactive action button for agent-style recommendations.
 * Renders different styles and click behaviors based on action type.
 * Visual config imported from data/actionPlans, text from i18n.
 *
 * @module components/report/ActionButton
 */

'use client'

import {
  Phone,
  ShieldAlert,
  Ban,
  ExternalLink,
  Flag,
  Trash2,
  MessageCircleOff,
  Link2Off,
  BanknoteArrowDown,
  BadgeCheck,
  Info,
  ChevronRight,
} from 'lucide-react'
import type { ActionItem } from '@/types/analysis'
import { ACTION_VISUAL_CONFIG } from '@/data/actionPlans'
import { useLanguage } from '@/hooks/useLanguage'

/** Maps icon name strings from data config to actual Lucide components */
const ICON_MAP: Record<string, typeof Phone> = {
  Phone,
  ShieldAlert,
  Ban,
  ExternalLink,
  Flag,
  Trash2,
  MessageCircleOff,
  Link2Off,
  BanknoteArrowDown,
  BadgeCheck,
  Info,
}

interface ActionButtonProps {
  action: ActionItem
  index: number
}

/**
 * Renders an interactive action button based on the AI's recommendation.
 * Clickable actions (phone calls, external links) open native handlers.
 * Non-clickable actions display as informational cards.
 */
export default function ActionButton({ action, index }: ActionButtonProps) {
  const { t } = useLanguage()
  const config = ACTION_VISUAL_CONFIG[action.type] || ACTION_VISUAL_CONFIG.info
  const Icon = ICON_MAP[config.iconName] || Info
  const isClickable = config.isClickable && (action.url || action.phone)

  function handleClick() {
    if (action.phone) {
      window.location.href = `tel:${action.phone}`
    } else if (action.url) {
      window.open(action.url, '_blank', 'noopener,noreferrer')
    }
  }

  const Tag = isClickable ? 'button' : 'div'

  return (
    <Tag
      {...(isClickable && { onClick: handleClick })}
      className={`
        w-full flex items-center gap-3 p-3.5 rounded-md 
        ${config.bgColor}
        ${isClickable
          ? 'hover:shadow-md active:scale-[0.98] cursor-pointer transition-all duration-200'
          : ''
        }
        text-left
      `}
    >
      {/* Icon */}
      <div className={`
        w-10 h-10 rounded-xl flex items-center justify-center shrink-0
        ${config.iconBg}
      `}>
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary leading-snug">
          {action.label}
        </p>
        {action.phone && (
          <p className="text-xs text-text-secondary mt-0.5">
            {t('report.phoneLabel')}: {action.phone}
          </p>
        )}
      </div>

      {/* Arrow for clickable actions */}
      {isClickable && (
        <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
      )}
    </Tag>
  )
}
