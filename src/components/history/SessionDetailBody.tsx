import type { SessionDetailModel } from "../../hooks/use-session-detail";
import { LapsSplit } from "../laps/LapsSplit";
import { LapLines } from "../laps/LapLines";
import { SessionSummaryPane } from "./SessionSummaryPane";
import { SessionActions } from "./SessionActions";
import { DeleteSessionDialog } from "./DeleteSessionDialog";

export interface SessionDetailBodyProps {
  detail: SessionDetailModel;
}

export const SessionDetailBody = ({ detail }: SessionDetailBodyProps) => (
  <LapsSplit
    top={<SessionSummaryPane detail={detail} />}
    bottom={
      <>
        <LapLines laps={detail.session.laps} />
        <SessionActions
          exports={detail.exports}
          onExport={detail.share}
          onDelete={detail.askDelete}
        />
        <DeleteSessionDialog detail={detail} />
      </>
    }
  />
);
