import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";

export interface MlSubScores {
  cash_flow_stability: number;
  customer_base: number;
  growth: number;
  reliability: number;
}

export interface MlScoreResponse {
  user_id: string;
  score: number;
  pd: number;
  sub_scores: MlSubScores;
  model_version: string;
  computed_at: string;
}

export interface MlFactorExplanation {
  feature: string;
  value: string;
  phrasing: string;
  score_delta: number;
}

export interface MlExplainResponse {
  user_id: string;
  score: number;
  pd: number;
  helping: MlFactorExplanation[];
  hurting: MlFactorExplanation[];
  model_version: string;
}

export interface MlFraudRequest {
  transaction_id: string;
  user_id: string;
  occurred_at: string;
  amount_kobo: number;
  sender_name: string;
  type: "inflow" | "outflow";
}

export interface MlFraudResponse {
  transaction_id: string;
  user_id: string;
  anomaly_score: number;
  is_anomalous: boolean;
  top_signals: string[];
  fraud_penalty: number;
}

export interface MlDailyForecast {
  date: string;
  predicted_inflow_kobo: number;
  lower_bound_kobo: number;
  upper_bound_kobo: number;
}

export interface MlDipWarning {
  dip_start_date: string;
  dip_end_date: string;
  severity: string;
  expected_gap_kobo: number;
  suggested_loan_kobo: number;
}

export interface MlForecastResponse {
  user_id: string;
  model_version: string;
  daily: MlDailyForecast[];
  dip_warning: MlDipWarning | null;
}

@Injectable()
export class MlClientService {
  private readonly logger = new Logger(MlClientService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>("ML_SERVICE_URL", "http://localhost:8000");
  }

  async predictScore(userId: string): Promise<MlScoreResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<MlScoreResponse>(`${this.baseUrl}/predict/score`, {
          user_id: userId,
        }),
      );
      return data;
    } catch (err) {
      this.logger.error(`predictScore failed for user ${userId}: ${err?.message}`);
      throw new ServiceUnavailableException("ML service unavailable");
    }
  }

  async predictExplain(userId: string): Promise<MlExplainResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<MlExplainResponse>(`${this.baseUrl}/predict/explain`, {
          user_id: userId,
        }),
      );
      return data;
    } catch (err) {
      this.logger.error(`predictExplain failed for user ${userId}: ${err?.message}`);
      throw new ServiceUnavailableException("ML service unavailable");
    }
  }

  async predictFraud(req: MlFraudRequest): Promise<MlFraudResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<MlFraudResponse>(`${this.baseUrl}/predict/fraud`, req),
      );
      return data;
    } catch (err) {
      this.logger.error(`predictFraud failed for txn ${req.transaction_id}: ${err?.message}`);
      throw new ServiceUnavailableException("ML service unavailable");
    }
  }

  async predictForecast(userId: string, horizonDays = 30): Promise<MlForecastResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<MlForecastResponse>(
          `${this.baseUrl}/predict/forecast?user_id=${encodeURIComponent(userId)}&horizon_days=${horizonDays}`,
          null,
        ),
      );
      return data;
    } catch (err) {
      this.logger.error(`predictForecast failed for user ${userId}: ${err?.message}`);
      throw new ServiceUnavailableException("ML service unavailable");
    }
  }
}
