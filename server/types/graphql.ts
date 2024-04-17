import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Void: { input: any; output: any; }
};

export type ChargingEvents = {
  __typename?: 'ChargingEvents';
  day: Scalars['Int']['output'];
  month: Scalars['Int']['output'];
  week: Scalars['Int']['output'];
  year: Scalars['Int']['output'];
};

export type ChargingValuesPerHour = {
  __typename?: 'ChargingValuesPerHour';
  chargepoints: Array<Scalars['Float']['output']>;
  hour: Scalars['String']['output'];
  kW: Scalars['Float']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createSimulation: Simulation;
  deleteSimulation?: Maybe<Scalars['Void']['output']>;
  runSimulation: SimulationStatusResult;
  updateSimulation: Simulation;
};


export type MutationCreateSimulationArgs = {
  arrivalMultiplier: Scalars['Float']['input'];
  carConsumption: Scalars['Float']['input'];
  chargingPower: Scalars['Float']['input'];
  numChargePoints: Scalars['Int']['input'];
};


export type MutationDeleteSimulationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRunSimulationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateSimulationArgs = {
  arrivalMultiplier?: InputMaybe<Scalars['Float']['input']>;
  carConsumption?: InputMaybe<Scalars['Float']['input']>;
  chargingPower?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['ID']['input'];
  numChargePoints?: InputMaybe<Scalars['Int']['input']>;
};

export type Query = {
  __typename?: 'Query';
  health?: Maybe<Scalars['String']['output']>;
  simulation?: Maybe<Simulation>;
  simulations: Array<Simulation>;
};


export type QuerySimulationArgs = {
  id: Scalars['ID']['input'];
};

export type Simulation = {
  __typename?: 'Simulation';
  arrivalMultiplier: Scalars['Float']['output'];
  carConsumption: Scalars['Float']['output'];
  chargingPower: Scalars['Float']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  numChargePoints: Scalars['Int']['output'];
  results?: Maybe<Array<SimulationResult>>;
  status: SimulationStatus;
  updatedAt: Scalars['String']['output'];
};

export type SimulationResult = {
  __typename?: 'SimulationResult';
  chargingEvents: ChargingEvents;
  chargingValuesPerHour: Array<ChargingValuesPerHour>;
  createdAt: Scalars['String']['output'];
  totalEnergyCharged: Scalars['Float']['output'];
  updatedAt: Scalars['String']['output'];
};

export enum SimulationStatus {
  Failed = 'FAILED',
  Running = 'RUNNING',
  Scheduled = 'SCHEDULED',
  Success = 'SUCCESS'
}

export type SimulationStatusResult = {
  __typename?: 'SimulationStatusResult';
  status: SimulationStatus;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  ChargingEvents: ResolverTypeWrapper<ChargingEvents>;
  ChargingValuesPerHour: ResolverTypeWrapper<ChargingValuesPerHour>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  Simulation: ResolverTypeWrapper<Simulation>;
  SimulationResult: ResolverTypeWrapper<SimulationResult>;
  SimulationStatus: SimulationStatus;
  SimulationStatusResult: ResolverTypeWrapper<SimulationStatusResult>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Void: ResolverTypeWrapper<Scalars['Void']['output']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  ChargingEvents: ChargingEvents;
  ChargingValuesPerHour: ChargingValuesPerHour;
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: {};
  Query: {};
  Simulation: Simulation;
  SimulationResult: SimulationResult;
  SimulationStatusResult: SimulationStatusResult;
  String: Scalars['String']['output'];
  Void: Scalars['Void']['output'];
};

export type ChargingEventsResolvers<ContextType = any, ParentType extends ResolversParentTypes['ChargingEvents'] = ResolversParentTypes['ChargingEvents']> = {
  day?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  month?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  week?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  year?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ChargingValuesPerHourResolvers<ContextType = any, ParentType extends ResolversParentTypes['ChargingValuesPerHour'] = ResolversParentTypes['ChargingValuesPerHour']> = {
  chargepoints?: Resolver<Array<ResolversTypes['Float']>, ParentType, ContextType>;
  hour?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  kW?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createSimulation?: Resolver<ResolversTypes['Simulation'], ParentType, ContextType, RequireFields<MutationCreateSimulationArgs, 'arrivalMultiplier' | 'carConsumption' | 'chargingPower' | 'numChargePoints'>>;
  deleteSimulation?: Resolver<Maybe<ResolversTypes['Void']>, ParentType, ContextType, RequireFields<MutationDeleteSimulationArgs, 'id'>>;
  runSimulation?: Resolver<ResolversTypes['SimulationStatusResult'], ParentType, ContextType, RequireFields<MutationRunSimulationArgs, 'id'>>;
  updateSimulation?: Resolver<ResolversTypes['Simulation'], ParentType, ContextType, RequireFields<MutationUpdateSimulationArgs, 'id'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  health?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  simulation?: Resolver<Maybe<ResolversTypes['Simulation']>, ParentType, ContextType, RequireFields<QuerySimulationArgs, 'id'>>;
  simulations?: Resolver<Array<ResolversTypes['Simulation']>, ParentType, ContextType>;
};

export type SimulationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Simulation'] = ResolversParentTypes['Simulation']> = {
  arrivalMultiplier?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  carConsumption?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  chargingPower?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  numChargePoints?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  results?: Resolver<Maybe<Array<ResolversTypes['SimulationResult']>>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['SimulationStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SimulationResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['SimulationResult'] = ResolversParentTypes['SimulationResult']> = {
  chargingEvents?: Resolver<ResolversTypes['ChargingEvents'], ParentType, ContextType>;
  chargingValuesPerHour?: Resolver<Array<ResolversTypes['ChargingValuesPerHour']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  totalEnergyCharged?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SimulationStatusResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['SimulationStatusResult'] = ResolversParentTypes['SimulationStatusResult']> = {
  status?: Resolver<ResolversTypes['SimulationStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface VoidScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Void'], any> {
  name: 'Void';
}

export type Resolvers<ContextType = any> = {
  ChargingEvents?: ChargingEventsResolvers<ContextType>;
  ChargingValuesPerHour?: ChargingValuesPerHourResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Simulation?: SimulationResolvers<ContextType>;
  SimulationResult?: SimulationResultResolvers<ContextType>;
  SimulationStatusResult?: SimulationStatusResultResolvers<ContextType>;
  Void?: GraphQLScalarType;
};

