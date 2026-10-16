import { useEffect, useRef, useState } from "react";
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from "react-native";
import { LIVE_PAGES } from "../lib/live-tiles";

export interface LivePager {
  page: number;
  width: number;
  scrollRef: React.RefObject<ScrollView | null>;
  onLayout: (event: LayoutChangeEvent) => void;
  onSwipeEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  select: (page: number) => void;
}

const clampPage = (page: number): number =>
  Math.min(LIVE_PAGES.length - 1, Math.max(0, page));

export const useLivePager = (): LivePager => {
  const scrollRef = useRef<ScrollView | null>(null);
  const [page, setPage] = useState(0);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    scrollRef.current?.scrollTo({ x: page * width, animated: false });
  }, [width]);
  return {
    page,
    width,
    scrollRef,
    onLayout: (event) => {
      setWidth(event.nativeEvent.layout.width);
    },
    onSwipeEnd: (event) => {
      if (width === 0) return;
      setPage(clampPage(Math.round(event.nativeEvent.contentOffset.x / width)));
    },
    select: (next) => {
      setPage(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    },
  };
};
