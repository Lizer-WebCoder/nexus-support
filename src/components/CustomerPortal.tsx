import { useState, useMemo, useEffect } from 'react';
import {
  Search, CheckCircle2, Ticket, BookOpen, ArrowLeft, MessageSquare,
  LogOut, User, Star, Home, ExternalLink, Users,
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import { usePlatform } from '../context/PlatformContext';
import type { Priority, Ticket as TicketType } from '../types';
import { INITIAL_BRANCHES } from '../data';
import PortalLiveChat from './PortalLiveChat';
import PortalAuthGate from './PortalAuthGate';
import PortalHome from './PortalHome';
import PortalCommunityChat from './PortalCommunityChat';
import ThemeToggle from './ThemeToggle';

interface Props { onBackToAgent?: () => void; }
type PortalView = 'home' | 'submit' | 'track' | 'success' | 'help' | 'chat' | 'account' | 'mytickets' | 'community';
